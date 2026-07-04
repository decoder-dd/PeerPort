'use client';

import { useContractEvents } from '@/hooks/useContractEvents';
import { useWalletStore } from '@/state/useWalletStore';
import { getExplorerContractUrl, type ContractEvent } from '@/services/rpc';
import { Activity, Clock, ExternalLink, Star, Lock, CheckCircle2, Tag, XCircle } from 'lucide-react';
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
        const vec = rawVal.vec();
        const seller = vec?.[0]?.address()?.toString() || 'Unknown';
        const price = (Number(vec?.[1]?.i128()?.lo() || 0) / 10_000_000).toFixed(2);
        const title = vec?.[2]?.str()?.toString() || 'Listing';
        return {
          title: 'Listing Created',
          description: `Merchant published listing "${title}" for ${price} XLM`,
          user: seller,
          type: 'create',
          icon: <Tag className="h-4 w-4 text-cyan-400" />,
          style: 'border-cyan-500/10 bg-cyan-500/[0.02]',
        };
      }

      if (topicSymbol === 'lst_lock') {
        const vec = rawVal.vec();
        const buyer = vec?.[0]?.address()?.toString() || 'Unknown';
        const price = (Number(vec?.[1]?.i128()?.lo() || 0) / 10_000_000).toFixed(2);
        return {
          title: 'Escrow Locked',
          description: `Buyer deposited ${price} XLM into contract for listing #${evt.topics[1]}`,
          user: buyer,
          type: 'lock',
          icon: <Lock className="h-4 w-4 text-amber-400" />,
          style: 'border-amber-500/10 bg-amber-500/[0.02]',
        };
      }

      if (topicSymbol === 'lst_comp') {
        const vec = rawVal.vec();
        const buyer = vec?.[1]?.address()?.toString() || 'Buyer';
        return {
          title: 'Listing Completed',
          description: `Trade finalized: funds released to merchant, delivery confirmed`,
          user: buyer,
          type: 'complete',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          style: 'border-emerald-500/10 bg-emerald-500/[0.02]',
        };
      }

      if (topicSymbol === 'lst_canc') {
        const seller = rawVal.address()?.toString() || 'Seller';
        return {
          title: 'Listing Cancelled',
          description: `Listing #${evt.topics[1]} was cancelled by merchant`,
          user: seller,
          type: 'cancel',
          icon: <XCircle className="h-4 w-4 text-rose-400" />,
          style: 'border-rose-500/10 bg-rose-500/[0.02]',
        };
      }

      if (topicSymbol === 'rep_upd') {
        const vec = rawVal.vec();
        const score = vec?.[0]?.u32() || 0;
        const level = vec?.[1]?.u32() || 1;
        const trades = vec?.[2]?.u32() || 0;
        return {
          title: 'Reputation Upgraded',
          description: `User level increased to ${level} (Score: ${score}, Completed Trades: ${trades})`,
          user: evt.topics[1] ? StellarSdk.xdr.ScVal.fromXDR(evt.topics[1], 'base64').address()?.toString() : 'User',
          type: 'reputation',
          icon: <Star className="h-4 w-4 text-purple-400" />,
          style: 'border-purple-500/10 bg-purple-500/[0.02]',
        };
      }

      return {
        title: 'Contract Event',
        description: `Triggered topic: "${topicSymbol}"`,
        user: evt.contractId,
        type: 'raw',
        icon: <Activity className="h-4 w-4 text-zinc-400" />,
        style: 'border-white/5 bg-white/[0.01]',
      };
    } catch {
      return {
        title: 'System Event',
        description: 'Failed to parse Soroban event XDR payload',
        user: evt.contractId,
        type: 'error',
        icon: <XCircle className="h-4 w-4 text-rose-400" />,
        style: 'border-rose-500/10 bg-rose-500/[0.02]',
      };
    }
  };

  const formatAddr = (addr: string) => {
    if (!addr) return 'N/A';
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  if (!contractId) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center p-8 text-center text-zinc-500 border-dashed border-white/10">
        <Activity className="mb-2 h-8 w-8 text-zinc-600 animate-pulse" />
        <p className="text-sm font-semibold text-zinc-400">Activity Feed Offline</p>
        <p className="text-xs text-zinc-600 mt-1">Please deploy reputation and marketplace contracts in settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedEvents.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center p-8 text-center text-zinc-500 border-dashed border-white/10">
          <Clock className="mb-2 h-8 w-8 text-zinc-600 animate-pulse" />
          <p className="text-sm font-semibold text-zinc-400">Waiting for live ledger events...</p>
          <p className="text-xs text-zinc-600 mt-1">Execute a transaction or buy a listing to populate the feed.</p>
        </div>
      ) : (
        displayedEvents.map((evt) => {
          const parsed = parseEvent(evt);
          return (
            <div key={evt.id} className={`glass-panel border flex gap-4 p-4 items-start ${parsed.style}`}>
              <div className="rounded-xl p-2.5 bg-zinc-950 border border-white/5 flex items-center justify-center">
                {parsed.icon}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-zinc-200 tracking-tight">{parsed.title}</p>
                  <span className="text-[10px] text-zinc-500 font-mono font-semibold">Ledger: {evt.ledger}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{parsed.description}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Account</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-300">
                    {formatAddr(parsed.user)}
                  </span>
                </div>
              </div>
              <a
                href={getExplorerContractUrl(network, evt.contractId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
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
