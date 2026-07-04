'use client';

import { useCallback } from 'react';
import { useWalletStore } from '@/state/useWalletStore';
import { connectWallet, resetWalletKit, signTransaction, disconnectWallet } from '@/services/wallet';
import { logger } from '@/services/tracking';

export function useStellarWallet() {
  const {
    address,
    isConnected,
    isConnecting,
    network,
    walletName,
    error,
    setAddress,
    setConnected,
    setConnecting,
    setWalletName,
    setError,
    disconnect: disconnectStore,
  } = useWalletStore();

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      const networkType = network === 'local' ? 'testnet' : network;
      const result = await connectWallet(networkType);
      setAddress(result.address);
      setWalletName(result.walletName);
      setConnected(true);
      logger.info('Wallet connected', { address: result.address, wallet: result.walletName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      logger.error('Wallet connection failed', { error: message });
    } finally {
      setConnecting(false);
    }
  }, [network, setAddress, setConnected, setConnecting, setError, setWalletName]);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    disconnectStore();
    resetWalletKit();
    logger.info('Wallet disconnected');
  }, [disconnectStore]);

  const sign = useCallback(
    async (xdr: string) => {
      if (!isConnected) throw new Error('Wallet not connected');
      try {
        const networkType = network === 'local' ? 'testnet' : network;
        return await signTransaction(xdr, networkType);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction signing failed';
        logger.error('Transaction signing failed', { error: message });
        throw err;
      }
    },
    [isConnected, network]
  );

  const shortenAddress = useCallback((addr?: string | null) => {
    const a = addr || address;
    if (!a) return '';
    return `${a.slice(0, 4)}...${a.slice(-4)}`;
  }, [address]);

  return {
    address,
    isConnected,
    isConnecting,
    network,
    walletName,
    error,
    connect,
    disconnect,
    sign,
    shortenAddress,
  };
}
