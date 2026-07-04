'use client';

import { useState } from 'react';
import { useWalletStore } from '@/state/useWalletStore';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { logger } from '@/services/tracking';
import { Network, Cpu, ShieldCheck, Download, Wallet } from 'lucide-react';

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
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10 animate-fade-in relative z-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Application Settings</h1>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Configure wallet connections, networks, custom endpoints, and export logs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Wallet & Connection settings */}
        <div className="glass-panel p-6 bg-zinc-950/20 border-white/5 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            Wallet Connection
          </h2>

          <div className="space-y-4">
            {isConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Connected Wallet</span>
                    <span className="font-extrabold text-zinc-200 capitalize flex items-center gap-1">
                      <Wallet className="h-3.5 w-3.5" />
                      {walletName}
                    </span>
                  </div>
                  <div className="space-y-1 border-t border-white/5 pt-3">
                    <span className="text-zinc-500 text-[10px] block uppercase font-bold tracking-wider">Address</span>
                    <span className="font-mono text-zinc-300 text-xs break-all block leading-relaxed">{address}</span>
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="btn-secondary w-full text-xs font-bold text-rose-400 border-rose-500/10 hover:bg-rose-500/5 hover:border-rose-500/25 py-3"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  No active wallet connection detected. Connect your browser wallet extension to enable smart contract execution.
                </p>
                <button onClick={connect} className="btn-primary w-full text-xs py-3 font-bold">
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Network & RPC Config */}
        <div className="glass-panel p-6 bg-zinc-950/20 border-white/5 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-400" />
            Network Node Config
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Active Network</label>
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
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide border capitalize transition-all ${
                      network === net
                        ? 'border-indigo-500/30 bg-indigo-500/10 text-white'
                        : 'border-white/5 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Soroban RPC URL</label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className="w-full text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Debug Logs & Diagnostics */}
        <div className="glass-panel p-6 bg-zinc-950/20 border-white/5 space-y-6 md:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            App Diagnostics & Logs
          </h2>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Diagnostics Export</h3>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                Export client-side activity logs, transaction execution summaries, and system states to a JSON file for debugging or local inspection.
              </p>
            </div>

            <button
              onClick={handleExportLogs}
              className="btn-secondary text-xs font-bold flex items-center gap-2 py-3 px-5"
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
