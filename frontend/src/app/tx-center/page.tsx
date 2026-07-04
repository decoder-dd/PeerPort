'use client';

import { useTxStore, type Transaction } from '@/state/useTxStore';
import { useWalletStore } from '@/state/useWalletStore';
import { getExplorerTxUrl } from '@/services/rpc';
import {
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  Trash2,
  Loader2,
} from 'lucide-react';

export default function TxCenterPage() {
  const { transactions, retryTransaction, clearTransactions } = useTxStore();
  const network = useWalletStore((s) => s.network);

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="badge-status badge-completed">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </span>
        );
      case 'failed':
        return (
          <span className="badge-status badge-cancelled">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        );
      case 'pending':
      case 'simulating':
      case 'submitting':
        return (
          <span className="badge-status badge-locked">
            <Loader2 className="h-3 w-3 animate-spin" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Transaction Logs</h1>
          <p className="text-zinc-500 text-xs mt-1 font-medium">
            Monitor and manage your Soroban smart contract transaction lifecycle history.
          </p>
        </div>

        {transactions.length > 0 && (
          <div>
            <button
              onClick={clearTransactions}
              className="btn-secondary text-xs font-semibold py-2.5 px-4 text-zinc-400 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Logs
            </button>
          </div>
        )}
      </div>

      {/* Main List */}
      {transactions.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center p-16 text-center text-zinc-500 border-dashed border-white/10">
          <ArrowLeftRight className="h-8 w-8 text-zinc-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-400">No Transactions Logged</p>
          <p className="text-xs text-zinc-600 mt-1 max-w-xs leading-relaxed">
            Execute purchase operations or escrow locks on the dashboard to populate these logs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="glass-panel p-5 bg-zinc-950/20 border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Side: Type & Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-extrabold text-zinc-200 uppercase tracking-tight">
                    {tx.type.replace(/_/g, ' ')}
                  </h3>
                  {getStatusBadge(tx.status)}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(tx.timestamp).toLocaleString()}
                  </span>
                  <span>•</span>
                  <span>ID: {tx.id.slice(0, 8)}...</span>
                </div>
              </div>

              {/* Right Side: Explorer Links / Actions */}
              <div className="flex items-center gap-3 md:self-center">
                {tx.error && (
                  <p className="text-[10px] text-rose-400 font-mono max-w-xs truncate border border-rose-500/10 bg-rose-500/5 px-2.5 py-1 rounded-lg">
                    {tx.error}
                  </p>
                )}
                {tx.hash && (
                  <a
                    href={getExplorerTxUrl(network, tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Stellar.Expert
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {tx.status === 'failed' && (
                  <button
                    onClick={() => retryTransaction(tx.id)}
                    className="btn-primary text-[10px] font-extrabold py-2 px-3 flex items-center gap-1 shadow-none"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
