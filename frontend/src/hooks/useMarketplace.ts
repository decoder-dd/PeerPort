'use client';

import { useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useListingStore, type Listing } from '@/state/useListingStore';
import { useTxStore } from '@/state/useTxStore';
import { useWalletStore } from '@/state/useWalletStore';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { simulateContractCall, submitTransaction } from '@/services/rpc';
import { logger } from '@/services/tracking';

const MARKETPLACE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID ||
  'CDPEERPORTMARKETPLACE12345678901234567890123456789012345';

function getTrackId(): string {
  return 'tx_' + Math.random().toString(36).substring(2, 15);
}

export function useMarketplace() {
  const { listings, addListing, updateListing, setLoading, setError } = useListingStore();
  const { addTransaction, updateTransaction } = useTxStore();
  const { address, network } = useWalletStore();
  const { sign } = useStellarWallet();

  const handleCreateListing = useCallback(
    async (price: number, title: string, description: string) => {
      if (!address) throw new Error('Wallet not connected');

      const trackId = getTrackId();
      addTransaction({
        id: trackId,
        type: 'create_listing',
        status: 'pending',
        hash: null,
        error: null,
        timestamp: Date.now(),
        details: { price, title, description },
      });

      try {
        logger.info('Initiating listing creation', { title, price });
        updateTransaction(trackId, { status: 'simulating' });

        const stroopsPrice = BigInt(Math.floor(price * 10_000_000));

        // Mock mode fallback for local preview/development
        if (MARKETPLACE_CONTRACT_ID.startsWith('CDPEERPORTMARKETPLACE')) {
          logger.info('Mock Mode: Simulating listing creation locally');
          await new Promise((resolve) => setTimeout(resolve, 1200));

          const listingId = listings.length + 1;
          const newListing: Listing = {
            id: listingId,
            seller: address,
            buyer: null,
            price: Number(stroopsPrice),
            status: 1, // Open
            title,
            description,
          };

          addListing(newListing);
          const mockHash = 'mock_hash_' + Math.random().toString(36).substring(2, 15);
          updateTransaction(trackId, { status: 'confirmed', hash: mockHash });
          logger.info('Mock listing created successfully', { listingId, hash: mockHash });
          return;
        }

        // Build Soroban contract call args
        const sellerScVal = StellarSdk.xdr.ScVal.scvAddress(
          StellarSdk.Address.fromString(address).toScAddress()
        );
        const priceScVal = StellarSdk.nativeToScVal(stroopsPrice, { type: 'i128' });
        const titleScVal = StellarSdk.xdr.ScVal.scvString(title);
        const descScVal = StellarSdk.xdr.ScVal.scvString(description);

        const { tx } = await simulateContractCall({
          contractId: MARKETPLACE_CONTRACT_ID,
          method: 'create_listing',
          args: [sellerScVal, priceScVal, titleScVal, descScVal],
          source: address,
          network,
        });

        updateTransaction(trackId, { status: 'submitting' });
        const xdr = tx.toXDR();
        const signedXdr = await sign(xdr);
        
        const response = await submitTransaction(signedXdr, network);
        
        const listingId = listings.length + 1;
        const newListing: Listing = {
          id: listingId,
          seller: address,
          buyer: null,
          price: Number(stroopsPrice),
          status: 1, // Open
          title,
          description,
        };
        
        addListing(newListing);
        updateTransaction(trackId, { status: 'confirmed', hash: response.hash });
        logger.info('Listing created successfully', { listingId, hash: response.hash });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Create listing failed';
        updateTransaction(trackId, { status: 'failed', error: errMsg });
        logger.error('Listing creation failed', { error: errMsg });
      }
    },
    [address, network, listings.length, addListing, addTransaction, updateTransaction, sign]
  );

  const handleBuyListing = useCallback(
    async (listingId: number) => {
      if (!address) throw new Error('Wallet not connected');

      const trackId = getTrackId();
      const listing = listings.find((l) => l.id === listingId);
      if (!listing) throw new Error('Listing not found');

      addTransaction({
        id: trackId,
        type: 'buy_listing',
        status: 'pending',
        hash: null,
        error: null,
        timestamp: Date.now(),
        details: { listingId, price: listing.price },
      });

      try {
        logger.info('Initiating listing purchase', { listingId });
        updateTransaction(trackId, { status: 'simulating' });

        // Mock mode fallback for local preview/development
        if (MARKETPLACE_CONTRACT_ID.startsWith('CDPEERPORTMARKETPLACE')) {
          logger.info('Mock Mode: Simulating listing purchase locally');
          await new Promise((resolve) => setTimeout(resolve, 1200));

          updateListing(listingId, { status: 2, buyer: address });
          const mockHash = 'mock_hash_' + Math.random().toString(36).substring(2, 15);
          updateTransaction(trackId, { status: 'confirmed', hash: mockHash });
          logger.info('Mock listing purchase confirmed', { listingId, hash: mockHash });
          return;
        }

        const buyerScVal = StellarSdk.xdr.ScVal.scvAddress(
          StellarSdk.Address.fromString(address).toScAddress()
        );
        const idScVal = StellarSdk.xdr.ScVal.scvU32(listingId);

        const { tx } = await simulateContractCall({
          contractId: MARKETPLACE_CONTRACT_ID,
          method: 'buy_listing',
          args: [buyerScVal, idScVal],
          source: address,
          network,
        });

        updateTransaction(trackId, { status: 'submitting' });
        const xdr = tx.toXDR();
        const signedXdr = await sign(xdr);
        
        const response = await submitTransaction(signedXdr, network);
        
        updateListing(listingId, { status: 2, buyer: address });
        updateTransaction(trackId, { status: 'confirmed', hash: response.hash });
        logger.info('Listing purchased/locked', { listingId, hash: response.hash });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Purchase failed';
        updateTransaction(trackId, { status: 'failed', error: errMsg });
        logger.error('Listing purchase failed', { error: errMsg });
      }
    },
    [address, network, listings, updateListing, addTransaction, updateTransaction, sign]
  );

  const handleCompleteListing = useCallback(
    async (listingId: number) => {
      if (!address) throw new Error('Wallet not connected');

      const trackId = getTrackId();
      const listing = listings.find((l) => l.id === listingId);
      if (!listing) throw new Error('Listing not found');

      addTransaction({
        id: trackId,
        type: 'complete_listing',
        status: 'pending',
        hash: null,
        error: null,
        timestamp: Date.now(),
        details: { listingId },
      });

      try {
        logger.info('Finalizing escrow release', { listingId });
        updateTransaction(trackId, { status: 'simulating' });

        // Mock mode fallback for local preview/development
        if (MARKETPLACE_CONTRACT_ID.startsWith('CDPEERPORTMARKETPLACE')) {
          logger.info('Mock Mode: Simulating escrow release locally');
          await new Promise((resolve) => setTimeout(resolve, 1200));

          updateListing(listingId, { status: 3 });
          const mockHash = 'mock_hash_' + Math.random().toString(36).substring(2, 15);
          updateTransaction(trackId, { status: 'confirmed', hash: mockHash });
          logger.info('Mock listing completion confirmed', { listingId, hash: mockHash });
          return;
        }

        const buyerScVal = StellarSdk.xdr.ScVal.scvAddress(
          StellarSdk.Address.fromString(address).toScAddress()
        );
        const idScVal = StellarSdk.xdr.ScVal.scvU32(listingId);

        const { tx } = await simulateContractCall({
          contractId: MARKETPLACE_CONTRACT_ID,
          method: 'complete_listing',
          args: [buyerScVal, idScVal],
          source: address,
          network,
        });

        updateTransaction(trackId, { status: 'submitting' });
        const xdr = tx.toXDR();
        const signedXdr = await sign(xdr);
        
        const response = await submitTransaction(signedXdr, network);
        
        updateListing(listingId, { status: 3 });
        updateTransaction(trackId, { status: 'confirmed', hash: response.hash });
        logger.info('Listing completion confirmed', { listingId, hash: response.hash });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Completion confirmation failed';
        updateTransaction(trackId, { status: 'failed', error: errMsg });
        logger.error('Listing completion failed', { error: errMsg });
      }
    },
    [address, network, listings, updateListing, addTransaction, updateTransaction, sign]
  );

  const handleCancelListing = useCallback(
    async (listingId: number) => {
      if (!address) throw new Error('Wallet not connected');

      const trackId = getTrackId();
      const listing = listings.find((l) => l.id === listingId);
      if (!listing) throw new Error('Listing not found');

      addTransaction({
        id: trackId,
        type: 'cancel_listing',
        status: 'pending',
        hash: null,
        error: null,
        timestamp: Date.now(),
        details: { listingId },
      });

      try {
        logger.info('Cancelling open listing', { listingId });
        updateTransaction(trackId, { status: 'simulating' });

        // Mock mode fallback for local preview/development
        if (MARKETPLACE_CONTRACT_ID.startsWith('CDPEERPORTMARKETPLACE')) {
          logger.info('Mock Mode: Simulating listing cancellation locally');
          await new Promise((resolve) => setTimeout(resolve, 1200));

          updateListing(listingId, { status: 4 });
          const mockHash = 'mock_hash_' + Math.random().toString(36).substring(2, 15);
          updateTransaction(trackId, { status: 'confirmed', hash: mockHash });
          logger.info('Mock listing cancelled successfully', { listingId, hash: mockHash });
          return;
        }

        const sellerScVal = StellarSdk.xdr.ScVal.scvAddress(
          StellarSdk.Address.fromString(address).toScAddress()
        );
        const idScVal = StellarSdk.xdr.ScVal.scvU32(listingId);

        const { tx } = await simulateContractCall({
          contractId: MARKETPLACE_CONTRACT_ID,
          method: 'cancel_listing',
          args: [sellerScVal, idScVal],
          source: address,
          network,
        });

        updateTransaction(trackId, { status: 'submitting' });
        const xdr = tx.toXDR();
        const signedXdr = await sign(xdr);
        
        const response = await submitTransaction(signedXdr, network);
        
        updateListing(listingId, { status: 4 });
        updateTransaction(trackId, { status: 'confirmed', hash: response.hash });
        logger.info('Listing cancelled successfully', { listingId, hash: response.hash });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Cancellation failed';
        updateTransaction(trackId, { status: 'failed', error: errMsg });
        logger.error('Listing cancellation failed', { error: errMsg });
      }
    },
    [address, network, listings, updateListing, addTransaction, updateTransaction, sign]
  );

  return {
    listings,
    handleCreateListing,
    handleBuyListing,
    handleCompleteListing,
    handleCancelListing,
    setLoading,
    setError,
  };
}
