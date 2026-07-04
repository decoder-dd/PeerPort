'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useWalletStore } from '@/state/useWalletStore';
import { getContractEvents, type ContractEvent, type NetworkType } from '@/services/rpc';
import { create } from 'zustand';

interface EventState {
  events: ContractEvent[];
  isPolling: boolean;
  lastLedger: number | null;
  addEvents: (events: ContractEvent[]) => void;
  setPolling: (polling: boolean) => void;
  setLastLedger: (ledger: number) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventState>()((set) => ({
  events: [],
  isPolling: false,
  lastLedger: null,
  addEvents: (newEvents) =>
    set((state) => {
      const existingIds = new Set(state.events.map((e) => e.id));
      const unique = newEvents.filter((e) => !existingIds.has(e.id));
      return { events: [...unique, ...state.events].slice(0, 200) };
    }),
  setPolling: (isPolling) => set({ isPolling }),
  setLastLedger: (lastLedger) => set({ lastLedger }),
  clearEvents: () => set({ events: [], lastLedger: null }),
}));

export function useContractEvents(contractId: string | undefined, pollInterval = 5000) {
  const network = useWalletStore((s) => s.network) as NetworkType;
  const { events, isPolling, lastLedger, addEvents, setPolling, setLastLedger } = useEventStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!contractId) return;
    try {
      const newEvents = await getContractEvents(network, contractId, lastLedger ?? undefined);
      if (newEvents.length > 0) {
        addEvents(newEvents);
        const maxLedger = Math.max(...newEvents.map((e) => e.ledger));
        setLastLedger(maxLedger + 1);
      }
    } catch (error) {
      console.error('[Events] Polling error:', error);
    }
  }, [contractId, network, lastLedger, addEvents, setLastLedger]);

  const startPolling = useCallback(() => {
    if (intervalRef.current || !contractId) return;
    setPolling(true);
    fetchEvents();
    intervalRef.current = setInterval(fetchEvents, pollInterval);
  }, [contractId, fetchEvents, pollInterval, setPolling]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
  }, [setPolling]);

  useEffect(() => {
    if (contractId) {
      startPolling();
    }
    return () => stopPolling();
  }, [contractId, startPolling, stopPolling]);

  return { events, isPolling };
}
