'use client';

import ActivityFeed from '@/components/ActivityFeed';
import { Info, HelpCircle, Activity } from 'lucide-react';

const MARKETPLACE_CONTRACT_ID = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID || 'CDPEERPORTMARKETPLACE12345678901234567890123456789012345';

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10 animate-fade-in relative z-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Live Activity</h1>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Real-time event subscriptions monitoring the Soroban transaction log lifecycle.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Event Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400 animate-pulse" />
              Event Stream
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Listening
            </span>
          </div>

          <ActivityFeed contractId={MARKETPLACE_CONTRACT_ID} limit={20} />
        </div>

        {/* Right Column: Explainer */}
        <div className="space-y-6">
          <div className="glass-panel p-5 space-y-4 bg-zinc-950/20 border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              Event Architecture
            </h3>
            <div className="space-y-3 text-xs text-zinc-500 leading-relaxed">
              <p>
                Soroban contracts emit structured events using the contract environments event publishing pipeline:
              </p>
              <pre className="bg-zinc-950/80 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-zinc-300 overflow-x-auto leading-normal">
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

          <div className="glass-panel p-5 space-y-4 bg-zinc-950/20 border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Info className="h-4 w-4 text-purple-400" />
              Contract Metadata
            </h3>
            <div className="space-y-3 text-[10px] font-semibold">
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider">Marketplace Address</span>
                <span className="bg-zinc-950 border border-white/5 p-2 rounded-lg font-mono text-zinc-300 block break-all mt-1">
                  {MARKETPLACE_CONTRACT_ID}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider">Network Target</span>
                <span className="bg-zinc-950 border border-white/5 p-2 rounded-lg font-mono text-zinc-300 block mt-1">
                  Stellar Testnet
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
