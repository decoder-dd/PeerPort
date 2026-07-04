'use client';

import { useState } from 'react';
import { useWalletStore } from '@/state/useWalletStore';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { logger } from '@/services/tracking';
import { Settings, Network, Cpu, ShieldCheck, Download } from 'lucide-react';

export default function SettingsPage() {
  const { network, setNetwork } = useWalletStore();
  const { address, isConnected, walletName, connect, disconnect } = useStellarWallet();
  const [rpcUrl, setRpcUrl] = useState(
    network === 'testnet'
      ? 'https://soroban-testnet.stellar.org'
      : network === 'local'
      ? 'http://localhost:8000/soroban/rpc'
      : 'https://soroban-rpc.stellar.org'
  );

  const handleExportLogs = () => {
    try {
      const logs = logger.getRecentLogs();
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `peerport-logs-${Date.now()}.json`;
      a.click();
      logger.info('User exported logs');
    } catch (e) {
      console.error('Failed to export logs', e);
    }
  };

  return (
    <div className="page-container space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100">Application Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Configure wallet connections, networks, custom endpoints, and export logs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Wallet & Connection settings */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-zinc-300" />
            Wallet Connection
          </h2>

          <div className="space-y-4">
            {isConnected ? (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-900/60 rounded-lg border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Connected Wallet</span>
                    <span className="font-bold text-zinc-300 capitalize">{walletName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Address</span>
                    <span className="font-mono text-zinc-300 break-all">{address}</span>
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="btn-secondary w-full text-sm text-red-400 border-red-500/10 hover:bg-red-500/5 hover:border-red-500/20"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-sm text-zinc-500">
                  No active wallet connection detected. Connect to trade assets on-chain.
                </p>
                <button onClick={connect} className="btn-primary w-full text-sm">
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Network & RPC Config */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
            <Network className="h-5 w-5 text-zinc-300" />
            Network Node Config
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-semibold">Active Network</label>
              <div className="grid grid-cols-3 gap-2">
                {(['testnet', 'mainnet', 'local'] as const).map((net) => (
                  <button
                    key={net}
                    onClick={() => {
                      setNetwork(net);
                      setRpcUrl(
                        net === 'testnet'
                          ? 'https://soroban-testnet.stellar.org'
                          : net === 'local'
                          ? 'http://localhost:8000/soroban/rpc'
                          : 'https://soroban-rpc.stellar.org'
                      );
                      logger.info('Switched network', { network: net });
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border capitalize transition-all ${
                      network === net
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-white/5 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-semibold">Soroban RPC URL</label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className="w-full bg-zinc-900/60 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-white/40 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Debug Logs & Diagnostics */}
        <div className="glass-card p-6 space-y-6 md:col-span-2">
          <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-zinc-300" />
            App Diagnostics & Logs
          </h2>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-300">Diagnostics Export</h3>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                Export client-side activity logs, transaction execution summaries, and system states to a JSON file for support or local inspection.
              </p>
            </div>

            <button
              onClick={handleExportLogs}
              className="btn-secondary flex items-center gap-2 text-sm text-white"
            >
              <Download className="h-4 w-4" />
              Export Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
