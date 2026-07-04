'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NetworkType = 'testnet' | 'mainnet' | 'local';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: NetworkType;
  walletName: string | null;
  error: string | null;

  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setNetwork: (network: NetworkType) => void;
  setWalletName: (name: string | null) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      isConnecting: false,
      network: 'testnet',
      walletName: null,
      error: null,

      setAddress: (address) => set({ address }),
      setConnected: (isConnected) => set({ isConnected }),
      setConnecting: (isConnecting) => set({ isConnecting }),
      setNetwork: (network) => set({ network }),
      setWalletName: (walletName) => set({ walletName }),
      setError: (error) => set({ error }),
      disconnect: () =>
        set({
          address: null,
          isConnected: false,
          isConnecting: false,
          walletName: null,
          error: null,
        }),
    }),
    {
      name: 'peerport-wallet',
      partialize: (state) => ({
        address: state.address,
        network: state.network,
        walletName: state.walletName,
      }),
    }
  )
);
