import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useWalletStore } from '@/state/useWalletStore';
import ListingCard from '@/components/ListingCard';
import Navbar from '@/components/Navbar';
import React from 'react';

// Mock Next.js navigation hook
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Zustand Wallet Store', () => {
  test('should initialize with default states', () => {
    const state = useWalletStore.getState();
    expect(state.address).toBeNull();
    expect(state.isConnected).toBe(false);
    expect(state.network).toBe('testnet');
  });

  test('should update states correctly when setAddress is called', () => {
    useWalletStore.getState().setAddress('GBUYER123456');
    useWalletStore.getState().setConnected(true);
    
    const state = useWalletStore.getState();
    expect(state.address).toBe('GBUYER123456');
    expect(state.isConnected).toBe(true);
    
    // Clean up
    useWalletStore.getState().disconnect();
  });
});

describe('ListingCard Component', () => {
  const sampleListing = {
    id: 1,
    seller: 'GSELLER123456',
    buyer: null,
    price: 150_000_000, // 15 XLM in stroops (7 decimals)
    status: 1, // Open
    title: 'Test Digital Good',
    description: 'Awesome test description details.',
  };

  test('should render listing details correctly', () => {
    render(<ListingCard listing={sampleListing} />);
    
    expect(screen.getByText('Test Digital Good')).toBeInTheDocument();
    expect(screen.getByText('Awesome test description details.')).toBeInTheDocument();
    expect(screen.getByText(/15\.00/i)).toBeInTheDocument();
    expect(screen.getByText('Open Listing')).toBeInTheDocument();
  });

  test('should show correct buttons based on connection state', () => {
    // Render without any callbacks/wallet address - it should show Buy button
    const mockBuy = vi.fn();
    render(<ListingCard listing={sampleListing} onBuy={mockBuy} currentAddress={null} />);
    
    const buyBtn = screen.getByRole('button', { name: /lock escrow/i });
    expect(buyBtn).toBeInTheDocument();
  });
});

describe('Navbar Component', () => {
  test('should render logo brand name and navigation items', () => {
    render(<Navbar />);
    
    expect(screen.getByText('PeerPort')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });
});
