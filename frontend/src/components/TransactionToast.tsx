'use client';

import { useTxStore, type TxStatus } from '@/state/useTxStore';
import { useWalletStore } from '@/state/useWalletStore';
import { getExplorerTxUrl } from '@/services/rpc';
import { CheckCircle2, XCircle, Loader2, ExternalLink, RotateCcw, X } from 'lucide-react';

const STATUS_CONFIG: Record<TxStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-zinc-400', label: 'Pending' },
  simulating: { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-zinc-300', label: 'Simulating' },
  submitting: { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-zinc-200', label: 'Submitting' },
  confirmed: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-white', label: 'Confirmed' },
  failed: { icon: <XCircle className="h-4 w-4" />, color: 'text-zinc-500', label: 'Failed' },
};

export default function TransactionToast() {
  const transactions = useTxStore((s) => s.transactions);
  const retryTransaction = useTxStore((s) => s.retryTransaction);
  const removeTransaction = useTxStore((s) => s.removeTransaction);
  const network = useWalletStore((s) => s.network);
  
  // Show active/pending or recently failed/confirmed transactions
  const activeOrRecent = transactions
    .filter((tx) => tx.status !== 'confirmed') // Don't show confirmed transactions as permanent toasts
    .slice(0, 3);

  if (activeOrRecent.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {activeOrRecent.map((tx) => {
        const config = STATUS_CONFIG[tx.status];
        return (
          <div
            key={tx.id}
            className="glass-card animate-slide-in flex items-center gap-3 p-3 shadow-xl border border-white/10"
          >
            <span className={config.color}>{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-200 truncate">
                {tx.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
              <p className={`text-xs ${config.color}`}>{config.label}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {tx.hash && (
                <a
                  href={getExplorerTxUrl(network, tx.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 transition hover:text-white"
                  title="View Transaction"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {tx.status === 'failed' && (
                <button
                  onClick={() => retryTransaction(tx.id)}
                  className="text-zinc-500 transition hover:text-white"
                  title="Retry"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => removeTransaction(tx.id)}
                className="text-zinc-500 transition hover:text-white"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
