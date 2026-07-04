import * as StellarSdk from '@stellar/stellar-sdk';

const NETWORK_CONFIG = {
  testnet: {
    rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
    networkPassphrase: StellarSdk.Networks.TESTNET,
    explorerUrl: 'https://stellar.expert/explorer/testnet',
  },
  mainnet: {
    rpcUrl: 'https://soroban-rpc.stellar.org',
    networkPassphrase: StellarSdk.Networks.PUBLIC,
    explorerUrl: 'https://stellar.expert/explorer/public',
  },
  local: {
    rpcUrl: 'http://localhost:8000/soroban/rpc',
    networkPassphrase: StellarSdk.Networks.STANDALONE,
    explorerUrl: '',
  },
} as const;

export type NetworkType = keyof typeof NETWORK_CONFIG;

export function getNetworkConfig(network: NetworkType) {
  return NETWORK_CONFIG[network];
}

export function getRpcClient(network: NetworkType): StellarSdk.rpc.Server {
  const config = getNetworkConfig(network);
  return new StellarSdk.rpc.Server(config.rpcUrl);
}

export function getExplorerTxUrl(network: NetworkType, txHash: string): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/tx/${txHash}`;
}

export function getExplorerContractUrl(network: NetworkType, contractId: string): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/contract/${contractId}`;
}

export interface ContractCallOptions {
  contractId: string;
  method: string;
  args: StellarSdk.xdr.ScVal[];
  source: string;
  network: NetworkType;
}

export async function simulateContractCall(options: ContractCallOptions) {
  const { contractId, method, args, source, network } = options;
  const config = getNetworkConfig(network);
  const server = getRpcClient(network);

  const account = await server.getAccount(source);
  const contract = new StellarSdk.Contract(contractId);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);
  return { tx, simulation };
}

export async function submitTransaction(
  signedXdr: string,
  network: NetworkType
): Promise<StellarSdk.rpc.Api.GetSuccessfulTransactionResponse & { hash: string }> {
  const server = getRpcClient(network);
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    getNetworkConfig(network).networkPassphrase
  );

  const response = await server.sendTransaction(tx);

  if (response.status === 'ERROR') {
    throw new Error(`Transaction submission failed: ${JSON.stringify(response)}`);
  }

  // Poll for confirmation
  let getResponse = await server.getTransaction(response.hash);
  while (getResponse.status === 'NOT_FOUND') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResponse = await server.getTransaction(response.hash);
  }

  if (getResponse.status === 'SUCCESS') {
    return {
      ...(getResponse as StellarSdk.rpc.Api.GetSuccessfulTransactionResponse),
      hash: response.hash,
    };
  }

  throw new Error(`Transaction failed: ${getResponse.status}`);
}

// Event polling for real-time activity feed
export interface ContractEvent {
  id: string;
  type: string;
  contractId: string;
  topics: string[];
  value: string;
  ledger: number;
  timestamp: number;
}

export async function getContractEvents(
  network: NetworkType,
  contractId: string,
  startLedger?: number
): Promise<ContractEvent[]> {
  const server = getRpcClient(network);

  try {
    let latestLedger = startLedger;
    if (!latestLedger) {
      const info = await server.getLatestLedger();
      latestLedger = info.sequence - 1000; // ~83 minutes back
    }

    const response = await server.getEvents({
      startLedger: latestLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [contractId],
        },
      ],
      limit: 50,
    });

    return (response.events || []).map((evt) => ({
      id: evt.id,
      type: evt.type,
      contractId: evt.contractId?.toString() || '',
      topics: evt.topic.map((t) => t.toXDR('base64')),
      value: evt.value.toXDR('base64'),
      ledger: evt.ledger,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('[RPC] Failed to fetch events:', error);
    return [];
  }
}
