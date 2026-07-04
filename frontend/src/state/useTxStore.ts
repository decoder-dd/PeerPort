'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TxStatus = 'pending' | 'simulating' | 'submitting' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  type: 'create_listing' | 'buy_listing' | 'complete_listing' | 'cancel_listing' | 'xlm_transfer';
  status: TxStatus;
  hash: string | null;
  error: string | null;
  timestamp: number;
  details: Record<string, unknown>;
  retryCount: number;
}

interface TxState {
  transactions: Transaction[];

  addTransaction: (tx: Omit<Transaction, 'retryCount'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  retryTransaction: (id: string) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
  getRecentTransactions: (limit?: number) => Transaction[];
}

export const useTxStore = create<TxState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [{ ...tx, retryCount: 0 }, ...state.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      retryTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, status: 'pending' as TxStatus, error: null, retryCount: t.retryCount + 1 }
              : t
          ),
        })),

      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      clearTransactions: () => set({ transactions: [] }),

      getRecentTransactions: (limit = 20) => {
        return get().transactions.slice(0, limit);
      },
    }),
    {
      name: 'peerport-transactions',
    }
  )
);
