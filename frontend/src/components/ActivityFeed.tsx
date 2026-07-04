'use client';

import { useContractEvents } from '@/hooks/useContractEvents';
import { useWalletStore } from '@/state/useWalletStore';
import { getExplorerContractUrl, type ContractEvent } from '@/services/rpc';
import { Activity, Clock, ExternalLink, Star } from 'lucide-react';
import * as StellarSdk from '@stellar/stellar-sdk';

interface ActivityFeedProps {
  contractId?: string;
  limit?: number;
}

export default function ActivityFeed({ contractId, limit = 10 }: ActivityFeedProps) {
  const { events } = useContractEvents(contractId);
  const network = useWalletStore((s) => s.network);

  const displayedEvents = events.slice(0, limit);

  // Helper to parse base64 XDR events to human-readable text
  const parseEvent = (evt: ContractEvent) => {
    try {
      // Decode topics
      const rawTopic = StellarSdk.xdr.ScVal.fromXDR(evt.topics[0], 'base64');
      const topicSymbol = rawTopic.sym().toString();

      const rawVal = StellarSdk.xdr.ScVal.fromXDR(evt.value, 'base64');

      if (topicSymbol === 'lst_cred') {
        // Listing Created: (seller, price, title)
        const vec = rawVal.vec();
        const seller = vec?.[0]?.address()?.toString() || 'Unknown';
        const price = (Number(vec?.[1]?.i128()?.lo() || 0) / 10_000_000).toFixed(2);
        const title = vec?.[2]?.str()?.toString() || 'Listing';
        return {
          title: 'Listing Created',
          description: `Merchant created listing "${title}" for ${price} XLM`,
          user: seller,
          type: 'create',
        };
      }

      if (topicSymbol === 'lst_lock') {
        // Listing Locked: (buyer, price)
        const vec = rawVal.vec();
        const buyer = vec?.[0]?.address()?.toString() || 'Unknown';
        const price = (Number(vec?.[1]?.i128()?.lo() || 0) / 10_000_000).toFixed(2);
        return {
          title: 'Escrow Locked',
          description: `Buyer paid ${price} XLM into escrow for listing #${evt.topics[1]}`,
          user: buyer,
          type: 'lock',
        };
      }

      if (topicSymbol === 'lst_comp') {
        // Listing Completed: (seller, buyer)
        const vec = rawVal.vec();
        const buyer = vec?.[1]?.address()?.toString() || 'Buyer';
        return {
          title: 'Listing Completed',
          description: `Trade finalized: funds released to merchant, delivery confirmed`,
          user: buyer,
          type: 'complete',
        };
      }

      if (topicSymbol === 'lst_canc') {
        // Listing Cancelled: seller address
        const seller = rawVal.address()?.toString() || 'Seller';
        return {
          title: 'Listing Cancelled',
          description: `Listing #${evt.topics[1]} cancelled by merchant`,
          user: seller,
          type: 'cancel',
        };
      }

      if (topicSymbol === 'rep_upd') {
        // Reputation Updated: (score, level, completed_trades)
        const vec = rawVal.vec();
        const score = vec?.[0]?.u32() || 0;
        const level = vec?.[1]?.u32() || 1;
        const trades = vec?.[2]?.u32() || 0;
        return {
          title: 'Reputation Upgraded',
          description: `User level increased to ${level} (Score: ${score}, Completed Trades: ${trades})`,
          user: evt.topics[1] ? StellarSdk.xdr.ScVal.fromXDR(evt.topics[1], 'base64').address()?.toString() : 'User',
          type: 'reputation',
        };
      }

      return {
        title: 'Contract Event',
        description: `Triggered topic: "${topicSymbol}"`,
        user: evt.contractId,
        type: 'raw',
      };
    } catch {
      return {
        title: 'System Event',
        description: 'Failed to parse Soroban event XDR payload',
        user: evt.contractId,
        type: 'error',
      };
    }
  };

  if (!contractId) {
    return (
      <div className="glass-card flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        <Activity className="mb-2 h-8 w-8 text-zinc-600" />
        <p className="text-sm">Activity feed unavailable</p>
        <p className="text-xs text-zinc-600">Please deploy and configure contract addresses in settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedEvents.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-8 text-center text-zinc-500">
          <Clock className="mb-2 h-8 w-8 text-zinc-600 animate-pulse" />
          <p className="text-sm">Waiting for live ledger events...</p>
          <p className="text-xs text-zinc-600">Create a listing or execute transactions to populate the feed</p>
        </div>
      ) : (
        displayedEvents.map((evt) => {
          const parsed = parseEvent(evt);
          return (
            <div key={evt.id} className="glass-card flex gap-4 p-4 items-start hover:border-white/10">
              <div className="rounded-lg p-2 bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                {parsed.type === 'reputation' ? (
                  <Star className="h-5 w-5 text-zinc-300" />
                ) : (
                  <Activity className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-200">{parsed.title}</p>
                  <span className="text-xs text-zinc-500 font-mono">Ledger: {evt.ledger}</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{parsed.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-zinc-500">Account:</span>
                  <span className="text-xs font-mono text-zinc-400">
                    {parsed.user.slice(0, 6)}...{parsed.user.slice(-6)}
                  </span>
                </div>
              </div>
              <a
                href={getExplorerContractUrl(network, evt.contractId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          );
        })
      )}
    </div>
  );
}
