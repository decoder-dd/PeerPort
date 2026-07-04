'use client';

import { create } from 'zustand';

export interface Listing {
  id: number;
  seller: string;
  buyer: string | null;
  price: number;
  status: number; // 1=Open, 2=Locked, 3=Completed, 4=Cancelled
  title: string;
  description: string;
}

interface ListingState {
  listings: Listing[];
  isLoading: boolean;
  error: string | null;

  setListings: (listings: Listing[]) => void;
  addListing: (listing: Listing) => void;
  updateListing: (id: number, updates: Partial<Listing>) => void;
  removeListing: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useListingStore = create<ListingState>()((set) => ({
  listings: [],
  isLoading: false,
  error: null,

  setListings: (listings) => set({ listings }),
  addListing: (listing) =>
    set((state) => ({ listings: [...state.listings, listing] })),
  updateListing: (id, updates) =>
    set((state) => ({
      listings: state.listings.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),
  removeListing: (id) =>
    set((state) => ({
      listings: state.listings.filter((l) => l.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
