'use client';

import ActivityFeed from '@/components/ActivityFeed';
import { Info, HelpCircle, Activity } from 'lucide-react';

const MARKETPLACE_CONTRACT_ID = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID || 'CDPEERPORTMARKETPLACE12345678901234567890123456789012345';

export default function FeedPage() {
  return (
    <div className="page-container space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100">Live Activity</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Real-time event subscriptions monitoring the Soroban transaction log lifecycle.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Event Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
              <Activity className="h-4 w-4 text-zinc-300" />
              Event Stream
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-green-500/10 text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
              Listening
            </span>
          </div>

          <ActivityFeed contractId={MARKETPLACE_CONTRACT_ID} limit={20} />
        </div>

        {/* Right Column: Explainer */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4 bg-zinc-950/20">
            <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-zinc-300" />
              Event Architecture
            </h3>
            <div className="space-y-3 text-sm text-zinc-500 leading-relaxed">
              <p>
                Soroban contracts emit structured events using the contract environments event publishing pipeline:
              </p>
              <pre className="bg-zinc-900/60 p-2.5 rounded-lg border border-white/5 font-mono text-xs text-zinc-300">
{`env.events().publish(
  (symbol_short!("lst_lock"), id),
  (buyer, price),
);`}
              </pre>
              <p>
                Our Next.js frontend uses a custom polling client configured to fetch events from the Soroban RPC server every 5 seconds.
              </p>
              <p>
                Events are decoded from XDR byte arrays into JavaScript objects, deduplicated by ledger ID, and used to update the global Zustand state store in real-time.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4 bg-white/5 border-white/10">
            <h3 className="text-md font-bold text-zinc-200 flex items-center gap-2">
              <Info className="h-4 w-4 text-zinc-300" />
              Contract Metadata
            </h3>
            <div className="space-y-2 text-xs font-mono text-zinc-500">
              <p className="text-zinc-400">Marketplace Address:</p>
              <p className="bg-zinc-900/50 p-2 rounded border border-white/5 break-all">
                {MARKETPLACE_CONTRACT_ID}
              </p>
              <p className="text-zinc-400 mt-4">Network Target:</p>
              <p className="bg-zinc-900/50 p-2 rounded border border-white/5">
                Stellar Testnet (RPC: soroban-testnet.stellar.org)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
