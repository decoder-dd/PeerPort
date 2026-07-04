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
  LogOut,
  Menu,
  X,
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
  const { address, isConnected, isConnecting, connect, disconnect, shortenAddress } =
    useStellarWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="gradient-text">PeerPort</span>
          <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-xs font-semibold text-zinc-300">
            Testnet
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-205 ${
                  active
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Wallet */}
        <div className="hidden items-center gap-3 md:flex">
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white/5 px-3 py-1.5 text-sm font-mono text-zinc-300">
                {shortenAddress()}
              </span>
              <button
                onClick={disconnect}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Wallet className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-zinc-800 bg-black/95 px-4 py-4 md:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active
                    ? 'bg-white/10 text-white border border-white/5'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <div className="mt-3 border-t border-white/5 pt-3">
            {isConnected && address ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-zinc-300">{shortenAddress()}</span>
                <button
                  onClick={() => {
                    disconnect();
                    setMobileOpen(false);
                  }}
                  className="text-sm text-red-400"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connect();
                  setMobileOpen(false);
                }}
                disabled={isConnecting}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                <Wallet className="h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
