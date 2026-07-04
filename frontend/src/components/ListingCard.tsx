'use client';

import type { Listing } from '@/state/useListingStore';
import { ShoppingCart, XCircle, CheckCircle2, Lock, Tag, User } from 'lucide-react';

const STATUS_MAP: Record<number, { label: string; className: string; icon: React.ReactNode }> = {
  1: { label: 'Open Listing', className: 'badge-open', icon: <Tag className="h-3 w-3" /> },
  2: { label: 'Escrow Locked', className: 'badge-locked', icon: <Lock className="h-3 w-3" /> },
  3: { label: 'Completed', className: 'badge-completed', icon: <CheckCircle2 className="h-3 w-3" /> },
  4: { label: 'Cancelled', className: 'badge-cancelled', icon: <XCircle className="h-3 w-3" /> },
};

interface ListingCardProps {
  listing: Listing;
  onBuy?: (id: number) => void;
  onCancel?: (id: number) => void;
  onComplete?: (id: number) => void;
  currentAddress?: string | null;
}

export default function ListingCard({
  listing,
  onBuy,
  onCancel,
  onComplete,
  currentAddress,
}: ListingCardProps) {
  const status = STATUS_MAP[listing.status] || STATUS_MAP[1];
  const isSeller = currentAddress === listing.seller;
  const isBuyer = currentAddress === listing.buyer;

  // Shorten helper
  const formatAddr = (addr: string) => {
    if (!addr) return 'N/A';
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 5)}...${addr.slice(-5)}`;
  };

  return (
    <div className="glass-panel p-6 bg-zinc-950/45 border-white/5 space-y-6 flex flex-col justify-between">
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
            Escrow Contract Offer #{listing.id}
          </span>
          <span className={`badge-status ${status.className}`}>
            {status.icon}
            {status.label}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-zinc-100 tracking-tight leading-snug line-clamp-1">
          {listing.title}
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
          {listing.description || 'No description provided.'}
        </p>
      </div>

      {/* Escrow Progress Timeline */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-zinc-500">
          <span className={listing.status >= 1 ? 'text-indigo-400' : ''}>1. Created</span>
          <span className={listing.status >= 2 ? 'text-amber-400' : ''}>2. Locked</span>
          <span className={listing.status === 3 ? 'text-emerald-400' : listing.status === 4 ? 'text-rose-400' : ''}>
            {listing.status === 4 ? '3. Cancelled' : '3. Released'}
          </span>
        </div>
        
        {/* Progress Bar Track */}
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden flex">
          <div className={`h-full ${listing.status >= 1 ? 'bg-indigo-500' : 'bg-transparent'}`} style={{ width: '33.33%' }} />
          <div className={`h-full ${listing.status >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} style={{ width: '33.33%' }} />
          <div className={`h-full ${listing.status === 3 ? 'bg-emerald-500' : listing.status === 4 ? 'bg-rose-500' : 'bg-transparent'}`} style={{ width: '33.34%' }} />
        </div>
      </div>

      {/* Addresses details */}
      <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 rounded-xl p-3 text-[10px]">
        <div>
          <span className="text-zinc-500 block uppercase font-bold tracking-wide">Seller</span>
          <span className="font-mono text-zinc-300 flex items-center gap-1.5 mt-0.5" title={listing.seller}>
            <User className="h-3 w-3 text-zinc-600" />
            {formatAddr(listing.seller)}
            {isSeller && <span className="text-[8px] bg-white/5 border border-white/10 px-1 py-0.2 rounded text-zinc-400">Me</span>}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block uppercase font-bold tracking-wide">Buyer</span>
          <span className="font-mono text-zinc-300 flex items-center gap-1.5 mt-0.5" title={listing.buyer || ''}>
            <User className="h-3 w-3 text-zinc-600" />
            {listing.buyer ? formatAddr(listing.buyer) : 'Unassigned'}
            {isBuyer && <span className="text-[8px] bg-white/5 border border-white/10 px-1 py-0.2 rounded text-zinc-400">Me</span>}
          </span>
        </div>
      </div>

      {/* Price & Primary Trigger Actions */}
      <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-4 mt-auto">
        <div>
          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Offer Price</span>
          <span className="text-lg font-black text-white leading-none">
            {(listing.price / 10_000_000).toFixed(2)} <span className="text-xs font-semibold text-zinc-400">XLM</span>
          </span>
        </div>

        <div className="flex gap-2">
          {listing.status === 1 && !isSeller && onBuy && (
            <button
              onClick={() => onBuy(listing.id)}
              className="btn-primary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 shadow-md"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Lock Escrow
            </button>
          )}
          {listing.status === 1 && isSeller && onCancel && (
            <button
              onClick={() => onCancel(listing.id)}
              className="btn-secondary text-xs font-semibold py-2.5 px-4 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 hover:border-rose-500/20"
            >
              Cancel Offer
            </button>
          )}
          {listing.status === 2 && isBuyer && onComplete && (
            <button
              onClick={() => onComplete(listing.id)}
              className="btn-primary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20 hover:shadow-emerald-500/35 border-none"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Release Escrow
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
