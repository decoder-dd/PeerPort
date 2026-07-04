'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useStellarWallet } from '@/hooks/useStellarWallet';

export default function Home() {
  const { isConnected, connect } = useStellarWallet();

  return (
    <div className="w-full flex flex-col justify-center items-center min-h-[80vh] px-6 text-center">
      <div className="max-w-2xl mx-auto space-y-10 flex flex-col items-center">
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
          Decentralized P2P<br />
          <span className="gradient-text-hero">Escrow Marketplace</span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Secure, peer-to-peer decentralized trading escrow marketplace built on Stellar. Rust smart contracts guarantee every transaction.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
          {isConnected ? (
            <Link href="/dashboard" className="btn-primary gap-2 text-sm px-8 py-3.5 w-full sm:w-auto">
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button onClick={connect} className="btn-primary gap-2 text-sm px-8 py-3.5 w-full sm:w-auto">
              Connect Wallet
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <Link href="/dashboard" className="btn-secondary gap-2 text-sm px-8 py-3.5 w-full sm:w-auto">
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
