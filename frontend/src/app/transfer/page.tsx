'use client';

import { useState } from 'react';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { useTxStore, type Transaction } from '@/state/useTxStore';
import { getRpcClient, getNetworkConfig, submitTransaction, getExplorerTxUrl } from '@/services/rpc';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Send, Clock, CheckCircle2, XCircle, Loader2, ExternalLink, ArrowRightLeft, Wallet, Info } from 'lucide-react';

export default function TransferPage() {
  const { isConnected, address, network, sign, shortenAddress } = useStellarWallet();
  const { transactions, addTransaction, updateTransaction } = useTxStore();

  // Form State
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  // Local UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Filter local direct transfer history
  const transferHistory = transactions.filter((t) => t.type === 'xlm_transfer');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address || !recipient || !amount) return;
    
    // Address format validation (starts with G and 56 characters)
    const stellarAddressRegex = /^G[A-D2-7][A-Z2-7]{54}$/;
    if (!stellarAddressRegex.test(recipient)) {
      setError('Invalid recipient address format. Stellar public keys must start with "G" and be 56 characters long.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const txId = Math.random().toString(36).substring(2, 15);
    addTransaction({
      id: txId,
      type: 'xlm_transfer',
      status: 'pending',
      hash: null,
      error: null,
      timestamp: Date.now(),
      details: { recipient, amount: numericAmount },
    });

    try {
      const config = getNetworkConfig(network);
      const server = getRpcClient(network);

      updateTransaction(txId, { status: 'simulating' });
      
      // Load source account details from ledger to fetch current sequence number
      const sourceAccount = await server.getAccount(address);

      // Check if destination account exists on-chain
      let recipientExists = true;
      try {
        await server.getAccount(recipient);
      } catch {
        recipientExists = false;
      }

      // If destination does not exist, check if amount is enough to create account (min 1.0 XLM)
      if (!recipientExists && numericAmount < 1.0) {
        throw new Error('Destination account is unfunded. The minimum amount to fund and create a new Stellar account is 1.0 XLM.');
      }

      // Build transaction builder
      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: '100000', // 0.01 XLM base fee
        networkPassphrase: config.networkPassphrase,
      })
        .addOperation(
          recipientExists
            ? StellarSdk.Operation.payment({
                destination: recipient,
                asset: StellarSdk.Asset.native(),
                amount: amount,
              })
            : StellarSdk.Operation.createAccount({
                destination: recipient,
                startingBalance: amount,
              })
        )
        .setTimeout(30)
        .build();

      const xdr = tx.toXDR();

      updateTransaction(txId, { status: 'submitting' });

      // Sign using wallets-kit
      const signedXdr = await sign(xdr);

      // Submit transaction and poll confirmation
      const result = await submitTransaction(signedXdr, network);

      updateTransaction(txId, {
        status: 'confirmed',
        hash: result.hash,
      });

      setSuccess(true);
      setAmount('');
      setRecipient('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      updateTransaction(txId, {
        status: 'failed',
        error: msg,
      });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">XLM Transfer</h1>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Transfer native Stellar Lumens (XLM) directly to any destination wallet address.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-6">
          {!isConnected && (
            <div className="glass-panel p-5 flex gap-4 items-start border-white/10 bg-white/5 backdrop-blur-md animate-pulse">
              <Info className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Wallet Not Authenticated</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Please connect your Stellar wallet using the navigation bar button to unlock transaction signing.
                </p>
              </div>
            </div>
          )}

          {isConnected && (
            <form onSubmit={handleTransfer} className="glass-panel p-6 bg-zinc-950/20 border-white/5 space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 border-b border-white/5 pb-3">
                <Send className="h-4 w-4 text-white" />
                New Transfer
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Recipient Address (Stellar G-Address)</label>
                  <input
                    type="text"
                    placeholder="e.g. GD5T9O4G...P5RE72YT"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full text-xs font-mono"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Amount (XLM)</label>
                    <input
                      type="number"
                      step="0.0000001"
                      placeholder="e.g. 5.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full text-xs"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Base Network Fee</label>
                    <div className="w-full bg-zinc-950/60 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-zinc-400 font-mono select-none">
                      0.0100000 XLM
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Alert Panels */}
              {error && (
                <div className="p-3.5 rounded-xl border border-rose-500/10 bg-rose-500/5 text-xs text-rose-400 leading-relaxed font-semibold break-all">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-xs text-emerald-400 leading-relaxed font-semibold">
                  Transaction confirmed! XLM successfully transferred.
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={isLoading || !recipient || !amount}
                  className="btn-primary text-xs font-bold py-3 px-6 shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send XLM
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Explainer */}
        <div className="space-y-6">
          <div className="glass-panel p-5 bg-zinc-950/20 border-white/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-white" />
              Source Wallet
            </h3>
            <div className="space-y-3 text-[10px] font-semibold">
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider">Account Address</span>
                <span className="bg-zinc-950 border border-white/5 p-2 rounded-lg font-mono text-zinc-300 block break-all mt-1">
                  {address || 'Not Connected'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider">Network Mode</span>
                <span className="bg-zinc-950 border border-white/5 p-2 rounded-lg font-mono text-zinc-300 block mt-1 capitalize">
                  {network}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4 pt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 border-b border-white/5 pb-3">
          <ArrowRightLeft className="h-4 w-4 text-white animate-pulse" />
          Transfer History
        </h2>

        {transferHistory.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center p-12 text-center text-zinc-500 border-dashed border-white/10">
            <Clock className="h-8 w-8 text-zinc-600 mb-3" />
            <p className="text-sm font-semibold text-zinc-400">No Transfers Logged</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs leading-relaxed">
              Initiate direct transfers to view on-chain ledger execution history.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transferHistory.map((tx) => (
              <div
                key={tx.id}
                className="glass-panel p-5 bg-zinc-950/20 border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Side: Type & Details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-tight">
                      Direct XLM Payment
                    </h3>
                    {getStatusBadge(tx.status)}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(tx.timestamp).toLocaleString()}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-mono">Recipient: {shortenAddress(tx.details.recipient as string)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-zinc-300 font-extrabold">Value: {tx.details.amount as number} XLM</span>
                  </div>
                </div>

                {/* Right Side: Explorer Links */}
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
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline"
                    >
                      View Tx
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
