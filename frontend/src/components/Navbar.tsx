'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import {
  LayoutDashboard,
  Activity,
  ArrowLeftRight,
  Settings,
  BarChart3,
  Wallet,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/feed', label: 'Activity', icon: Activity },
  { href: '/tx-center', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, connect, shortenAddress } =
    useStellarWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-3 md:px-8">
      <nav className="mx-auto max-w-5xl rounded-2xl border border-white/5 bg-zinc-950/70 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90 transition">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20">
              <Layers className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="gradient-text-accent font-extrabold">PeerPort</span>
            <span className="rounded-full bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
              Testnet
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1.5 md:flex">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                    active
                      ? 'bg-white/10 text-white shadow-inner border border-white/5'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Wallet Connector */}
          <div className="hidden items-center gap-3 md:flex">
            {isConnected && address ? (
              <Link 
                href="/settings"
                className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition duration-200"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono">{shortenAddress()}</span>
              </Link>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="btn-primary flex items-center gap-2 text-xs font-bold py-2.5 px-4.5"
              >
                <Wallet className="h-3.5 w-3.5" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 md:hidden transition"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu dropdown */}
        {mobileOpen && (
          <div className="mt-4 space-y-1.5 rounded-xl border border-white/5 bg-zinc-950/95 p-3 md:hidden animate-fade-in">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-white/10 text-white border border-white/5'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            <div className="mt-3 border-t border-white/5 pt-3">
              {isConnected && address ? (
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm font-semibold text-emerald-400"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono">{shortenAddress()}</span>
                  </div>
                  <span className="text-xs text-zinc-500">Configure</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    connect();
                    setMobileOpen(false);
                  }}
                  disabled={isConnecting}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm"
                >
                  <Wallet className="h-4 w-4" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
