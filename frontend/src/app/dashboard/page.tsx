'use client';

import { useState, useEffect } from 'react';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { useMarketplace } from '@/hooks/useMarketplace';
import ListingCard from '@/components/ListingCard';
import { PlusCircle, Info, RefreshCw, Layers } from 'lucide-react';
import { useListingStore, type Listing } from '@/state/useListingStore';

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

  // Initialize with mock listings if empty so the UI looks great immediately
  useEffect(() => {
    if (listings.length === 0) {
      // Add initial mock listings
      const mockListings: Listing[] = [
        {
          id: 1,
          seller: 'GD5T9O4G...P5RE72YT',
          buyer: null,
          price: 150_000_000,
          status: 1,
          title: 'Premium NFT Domain: peerport.stellar',
          description: 'A premium handpicked domain name ready for marketplace branding.',
        },
        {
          id: 2,
          seller: 'GCX7634J...WPO99221',
          buyer: null,
          price: 450_000_000,
          status: 1,
          title: 'Rust Soroban Audit Service',
          description: 'Full code review, security analysis, and test suite verification for 2 smart contracts.',
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
      // Set mock listings inside store directly
      // Since useMarketplace exports listings from useListingStore, we can initialize it
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

  return (
    <div className="page-container space-y-8 animate-fade-in">
      {/* Welcome & Dashboard header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100">Trade Panel</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Browse active contracts, buy listings, or setup a new escrow offer.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Create Listing
          </button>
        </div>
      </div>

      {/* Connection warning banner if not connected */}
      {!isConnected && (
        <div className="glass-card p-4 flex gap-3 items-start border-white/10 bg-white/5">
          <Info className="h-5 w-5 text-zinc-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-zinc-200">Wallet Disconnected</h4>
            <p className="text-xs text-zinc-500 mt-0.5">
              You can browse listings in read-only mode, but connecting your wallet is required to buy, create, or confirm escrow releases.
            </p>
            <button onClick={connect} className="text-xs text-white font-semibold hover:underline mt-2">
              Connect Wallet Now
            </button>
          </div>
        </div>
      )}

      {/* Create Listing Section */}
      {showCreateModal && (
        <div className="glass-card p-6 border-white/10 bg-zinc-950/40">
          <h2 className="text-lg font-bold text-zinc-200 mb-4">Create New Escrow Listing</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Listing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Domain Name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-white/40"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Price (XLM)</label>
                <input
                  type="number"
                  step="0.0000001"
                  placeholder="Price in XLM"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-white/40"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-semibold">Description / Delivery Details</label>
              <textarea
                placeholder="Specify what digital asset is being sold and how it will be delivered."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-zinc-900/60 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-white/40"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Publish Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-white/5 pb-px gap-4">
        {([
          { id: 'all', label: 'All Listings' },
          { id: 'mine', label: 'My Listings' },
          { id: 'purchases', label: 'My Purchases' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              filter === tab.id
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-16 text-center text-zinc-500">
          <Layers className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-lg font-bold text-zinc-400">No Listings Found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">
            There are no listings in this category. Connect your wallet or switch filter tabs.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              currentAddress={address}
              onBuy={handleBuyListing}
              onCancel={handleCancelListing}
              onComplete={handleCompleteListing}
            />
          ))}
        </div>
      )}
    </div>
  );
}
