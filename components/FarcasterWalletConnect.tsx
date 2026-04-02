'use client';

import { useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useFarcaster } from './FarcasterSDK';

// Auto-connects wallet in platform-specific environments:
// - Base App: auto-connect Coinbase Wallet
// - Farcaster: manual selection from dropdown
export function FarcasterWalletConnect() {
  const { isInMiniApp, isInBaseApp, platform, isLoading } = useFarcaster();
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  // Auto-connect Coinbase Wallet when in Base App environment
  useEffect(() => {
    if (isLoading || isConnected) return;
    if (!isInBaseApp) return;

    const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');
    if (coinbaseConnector) {
      console.log('[AutoConnect] Base App detected, connecting Coinbase Wallet...');
      connect({ connector: coinbaseConnector });
    }
  }, [isInBaseApp, isLoading, isConnected, connectors, connect]);

  // Debug logging
  useEffect(() => {
    console.log('[WalletAutoConnect] State:', { platform, isInMiniApp, isInBaseApp, isLoading, isConnected, address });
  }, [platform, isInMiniApp, isInBaseApp, isLoading, isConnected, address]);

  return null;
}
