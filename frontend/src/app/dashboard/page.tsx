'use client';

import { useState, useEffect } from 'react';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { useMarketplace } from '@/hooks/useMarketplace';
import ListingCard from '@/components/ListingCard';
import { PlusCircle, Info, RefreshCw, Layers, Wallet, BarChart3, Shield } from 'lucide-react';
import { useListingStore } from '@/state/useListingStore';

export default function Dashboard() {
  const { address, isConnected, connect } = useStellarWallet();
  const {
    listings,
    handleCreateListing,
    handleBuyListing,
    handleCompleteListing,
    handleCancelListing,
  } = useMarketplace();

  // Local UI State
  const [filter, setFilter] = useState<'all' | 'mine' | 'purchases'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize mock listings if empty
  useEffect(() => {
    if (listings.length === 0) {
      const mockListings = [
        {
          id: 1,
          seller: 'GSELLER123456...789',
          buyer: null,
          price: 150_000_000, // 15 XLM in stroops (7 decimals)
          status: 1, // Open
          title: 'Premium Developer NFT Artwork',
          description: 'Unique digital collectibles for Web3 builders, designed with high contrast glassmorphism.',
        },
        {
          id: 2,
          seller: 'GBUYER123456...000',
          buyer: 'GSELLER123456...789',
          price: 450_000_000, // 45 XLM
          status: 2, // Locked
          title: 'Decentralized Domain Name (.stellar)',
          description: 'Fully premium domain name registered on-chain with reputation contract validations.',
        },
        {
          id: 3,
          seller: 'GD228833...KKL88221',
          buyer: 'GD5T9O4G...P5RE72YT',
          price: 250_000_000,
          status: 2,
          title: 'Custom CSS Framer Design Template',
          description: 'Glassmorphic dashboard Figma design exported directly to CSS variables.',
        },
      ];
      useListingStore.getState().setListings(mockListings);
    }
  }, [listings.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;
    setIsSubmitting(true);
    try {
      await handleCreateListing(parseFloat(price), title, description);
      setTitle('');
      setDescription('');
      setPrice('');
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter listings
  const filteredListings = listings.filter((l) => {
    if (filter === 'mine') return l.seller === address;
    if (filter === 'purchases') return l.buyer === address;
    return true;
  });

  // Calculate stats
  const totalVolume = listings.reduce((sum, item) => sum + item.price, 0) / 10_000_000;
  const activeCount = listings.filter(item => item.status === 1).length;
  const lockedCount = listings.filter(item => item.status === 2).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10 animate-fade-in relative z-10">
      {/* Dashboard header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Trade Center</h1>
          <p className="text-zinc-500 text-xs mt-1 font-medium">
            Deploy contracts, manage secure listings, and finalize P2P escrow transfers.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs font-bold py-3 px-5 shadow-lg flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Listing
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 bg-zinc-950/20 border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Active Escrows</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{activeCount}</p>
        </div>

        <div className="glass-panel p-5 bg-zinc-950/20 border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Locked Funds</span>
            <Shield className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{lockedCount}</p>
        </div>

        <div className="glass-panel p-5 bg-zinc-950/20 border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Value</span>
            <BarChart3 className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalVolume.toFixed(2)} XLM</p>
        </div>

        <div className="glass-panel p-5 bg-zinc-950/20 border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">User Status</span>
            <Wallet className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-zinc-300 mt-2 truncate">
            {isConnected && address ? 'Authorized Wallet' : 'Disconnected'}
          </p>
        </div>
      </div>

      {/* Connection warning banner */}
      {!isConnected && (
        <div className="glass-panel p-5 flex gap-4 items-start border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md">
          <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Wallet Authentication Required</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You are currently viewing the marketplace in read-only mode. Connect your Stellar wallet to publish escrows, confirm locks, or release payments.
            </p>
            <button onClick={connect} className="text-xs text-indigo-400 font-bold hover:underline block pt-1">
              Connect Stellar Wallet ➔
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-white/5 pb-px gap-6">
        {([
          { id: 'all', label: 'All Listings' },
          { id: 'mine', label: 'My Listings' },
          { id: 'purchases', label: 'My Purchases' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all relative ${
              filter === tab.id
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center p-16 text-center text-zinc-500 border-dashed border-white/10">
          <Layers className="mb-3 h-8 w-8 text-zinc-600" />
          <p className="text-sm font-semibold text-zinc-400">No Listings Found</p>
          <p className="text-xs text-zinc-600 mt-1">There are no active trades matching the current filter criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredListings.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              currentAddress={address}
              onBuy={handleBuyListing}
              onComplete={handleCompleteListing}
              onCancel={handleCancelListing}
            />
          ))}
        </div>
      )}

      {/* Overlaid Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg p-6 bg-zinc-950 border-white/10 shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Create Escrow Listing</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Define your digital goods offer and lock criteria.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Listing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Domain Name Transfer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Price (XLM)</label>
                  <input
                    type="number"
                    step="0.0000001"
                    placeholder="e.g. 15.0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-sm"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Escrow Asset</label>
                  <select className="w-full text-sm bg-zinc-900/60 border border-white/5 rounded-lg px-3 py-2 text-zinc-200">
                    <option>Native XLM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Description / Delivery Details</label>
                <textarea
                  placeholder="Provide delivery instructions and key terms for the buyer..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full text-sm"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs font-semibold py-2.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs font-bold py-2.5 px-4 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Listing'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
