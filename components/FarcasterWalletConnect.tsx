'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useFarcaster } from './FarcasterSDK';

// This component no longer auto-connects
// Users can now manually select Farcaster Wallet from the dropdown
export function FarcasterWalletConnect() {
  const { isInMiniApp, isLoading } = useFarcaster();
  const { isConnected, address } = useAccount();

  // Debug logging only
  useEffect(() => {
    console.log('[FarcasterWallet] State:', { isInMiniApp, isLoading, isConnected, address });
  }, [isInMiniApp, isLoading, isConnected, address]);

  return null;
}
