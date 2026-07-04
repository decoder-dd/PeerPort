'use client';

import type { Listing } from '@/state/useListingStore';
import { ShoppingCart, XCircle, CheckCircle2, Lock, Tag } from 'lucide-react';

const STATUS_MAP: Record<number, { label: string; className: string; icon: React.ReactNode }> = {
  1: { label: 'Open', className: 'status-open', icon: <Tag className="h-3 w-3" /> },
  2: { label: 'Locked', className: 'status-locked', icon: <Lock className="h-3 w-3" /> },
  3: { label: 'Completed', className: 'status-completed', icon: <CheckCircle2 className="h-3 w-3" /> },
  4: { label: 'Cancelled', className: 'status-cancelled', icon: <XCircle className="h-3 w-3" /> },
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

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-100">{listing.title}</h3>
          <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{listing.description}</p>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
        >
          {status.icon}
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500">Price</p>
          <p className="text-xl font-bold gradient-text">
            {(listing.price / 10_000_000).toFixed(2)} XLM
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-zinc-500">Seller</p>
          <p className="font-mono text-sm text-zinc-400">
            {listing.seller.slice(0, 4)}...{listing.seller.slice(-4)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {listing.status === 1 && !isSeller && onBuy && (
          <button
            onClick={() => onBuy(listing.id)}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Buy Now
          </button>
        )}
        {listing.status === 1 && isSeller && onCancel && (
          <button
            onClick={() => onCancel(listing.id)}
            className="btn-secondary flex-1 text-sm text-red-400 hover:text-red-300"
          >
            Cancel Listing
          </button>
        )}
        {listing.status === 2 && isBuyer && onComplete && (
          <button
            onClick={() => onComplete(listing.id)}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Delivery
          </button>
        )}
      </div>
    </div>
  );
}
