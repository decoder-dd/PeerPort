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
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium status-completed">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium status-cancelled">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        );
      case 'pending':
      case 'simulating':
      case 'submitting':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium status-pending">
            <Loader2 className="h-3 w-3 animate-spin" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100">Transaction Center</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Track and manage your Soroban smart contract transaction lifecycle.
          </p>
        </div>

        {transactions.length > 0 && (
          <button
            onClick={clearTransactions}
            className="btn-secondary flex items-center gap-2 text-sm text-zinc-400 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Clear Logs
          </button>
        )}
      </div>

      {/* Main Panel */}
      {transactions.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-16 text-center text-zinc-500">
          <ArrowLeftRight className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-lg font-bold text-zinc-400">No Transactions Tracked</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">
            Execute operations on the dashboard to trigger transaction logs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10"
            >
              {/* Type & Timestamp */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-md font-bold text-zinc-200">
                    {tx.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </h3>
                  {getStatusBadge(tx.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(tx.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span>ID: {tx.id}</span>
                </div>
              </div>

              {/* Hash / Explorer Link / Error Message */}
              <div className="flex flex-col md:items-end gap-2">
                {tx.hash && (
                  <a
                    href={getExplorerTxUrl(network, tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-white font-semibold hover:underline"
                  >
                    View on StellarExpert
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {tx.error && (
                  <p className="text-xs text-red-400 max-w-xs md:text-right font-mono truncate">
                    {tx.error}
                  </p>
                )}
              </div>

              {/* Retry handler */}
              {tx.status === 'failed' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => retryTransaction(tx.id)}
                    className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
