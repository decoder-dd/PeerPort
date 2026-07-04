'use client';

import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet';
import { HanaModule } from '@creit.tech/stellar-wallets-kit/modules/hana';

let initialized = false;

function getNetworkPassphrase(network: 'testnet' | 'mainnet'): Networks {
  return network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;
}

export function initWalletKit(network: 'testnet' | 'mainnet' = 'testnet') {
  if (!initialized) {
    StellarWalletsKit.init({
      modules: [
        new FreighterModule(),
        new AlbedoModule(),
        new xBullModule(),
        new LobstrModule(),
        new RabetModule(),
        new HanaModule(),
      ],
      network: getNetworkPassphrase(network),
    });
    initialized = true;
  }
}

export function resetWalletKit() {
  initialized = false;
}

export { FREIGHTER_ID };

export async function connectWallet(
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ address: string; walletName: string }> {
  initWalletKit(network);

  // authModal opens the wallet selection modal and returns { address } on success
  const { address } = await StellarWalletsKit.authModal();

  return {
    address,
    walletName: 'stellar-wallet',
  };
}

export async function signTransaction(
  xdr: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string> {
  initWalletKit(network);
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
    networkPassphrase: getNetworkPassphrase(network),
  });
  return signedTxXdr;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    initWalletKit();
    const { address } = await StellarWalletsKit.getAddress();
    return address;
  } catch {
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    await StellarWalletsKit.disconnect();
  } catch {
    // Ignore errors during disconnect
  }
}
