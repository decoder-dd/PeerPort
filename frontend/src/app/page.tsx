'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Star, Cpu } from 'lucide-react';
import { useStellarWallet } from '@/hooks/useStellarWallet';

export default function Home() {
  const { isConnected, connect } = useStellarWallet();

  return (
    <div className="relative min-h-[90vh] overflow-hidden py-12 md:py-20">
      {/* Background Glows */}
      <div className="ambient-glow-purple" />
      <div className="ambient-glow-blue" />

      <div className="mx-auto max-w-5xl px-6 relative z-10 space-y-20">
        {/* Hero Area */}
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-400">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            Soroban Smart Contract Powered Escrow
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Decentralized P2P <br />
            <span className="gradient-text-hero">Escrow Marketplace</span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Trade digital assets securely with on-chain guarantees. Rust-based smart contracts handle locks, validations, and reputation rewards on the Stellar network.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            {isConnected ? (
              <Link href="/dashboard" className="btn-primary w-full sm:w-auto text-sm px-7 py-3 shadow-lg">
                Enter Trade Panel
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            ) : (
              <button onClick={connect} className="btn-primary w-full sm:w-auto text-sm px-7 py-3 shadow-lg">
                Connect Wallet
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            )}
            <Link href="/dashboard" className="btn-secondary w-full sm:w-auto text-sm px-7 py-3">
              Explore Active Listings
            </Link>
          </div>
        </div>

        {/* High-Fidelity Mockup Container */}
        <div className="glass-panel p-6 border-white/10 bg-zinc-950/40 shadow-2xl relative">
          <div className="absolute -top-3 left-6 rounded-md bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            Live Preview
          </div>
          
          <div className="space-y-4">
            {/* Mock Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 gap-2">
              <div>
                <span className="text-[10px] font-mono text-zinc-500">ESCROW CONTRACT #201</span>
                <h3 className="text-base font-bold text-zinc-200">Custom UI/UX Theme Export</h3>
              </div>
              <span className="badge-status badge-locked">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                Escrow Locked
              </span>
            </div>

            {/* Mock Timeline Progress */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] font-semibold text-zinc-500">
              <div className="border-t-2 border-indigo-500 pt-2 text-indigo-400">1. Listing Created</div>
              <div className="border-t-2 border-indigo-500 pt-2 text-indigo-400">2. Funds Locked</div>
              <div className="border-t-2 border-white/10 pt-2">3. Delivery & Release</div>
            </div>

            {/* Mock Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-2">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Escrow Value</span>
                <span className="text-sm font-bold text-white">45.00 XLM</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Seller Address</span>
                <span className="text-sm font-mono text-zinc-300">GSELLER...X2A</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Buyer Address</span>
                <span className="text-sm font-mono text-zinc-300">GBUYER...P5R</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Reputation Earned</span>
                <span className="text-sm text-purple-400 font-bold">+10 Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 pt-6">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-zinc-200">Zero-Fee Escrow</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Stellar SAC locks digital payments securely. Funds are held in decentralized smart contracts until delivery is verified.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Star className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-zinc-200">Portable Reputation</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every completed transaction levels up your smart contract reputation score. Display your verified trust rank anywhere.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-zinc-200">Automated SAC Rules</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">
              No middleman or arbitrator required. Smart contract constraints enforce cryptographic release criteria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
