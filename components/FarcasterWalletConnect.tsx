'use client';

import { useEffect, useRef } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { useFarcaster } from './FarcasterSDK';

export function FarcasterWalletConnect() {
  const { isInMiniApp, isLoading } = useFarcaster();
  const { connect, connectors, error } = useConnect();
  const { isConnected, address } = useAccount();
  const hasAttemptedConnect = useRef(false);

  // Log connection state changes
  useEffect(() => {
    console.log('[FarcasterWallet] State:', { isInMiniApp, isLoading, isConnected, address });
    console.log('[FarcasterWallet] Connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
    if (error) {
      console.log('[FarcasterWallet] Connection error:', error);
    }
  }, [isInMiniApp, isLoading, isConnected, address, connectors, error]);

  useEffect(() => {
    const connectWallet = async () => {
      console.log('[FarcasterWallet] Attempting connection...', {
        hasAttempted: hasAttemptedConnect.current,
        isLoading,
        isInMiniApp,
        isConnected
      });

      // Only try once, only in Mini App, only if not already connected
      if (hasAttemptedConnect.current || isLoading || !isInMiniApp || isConnected) {
        console.log('[FarcasterWallet] Skipping connection');
        return;
      }
      hasAttemptedConnect.current = true;

      try {
        // Get the Farcaster wallet provider and inject it
        console.log('[FarcasterWallet] Getting Farcaster provider...');
        const provider = await sdk.wallet.getEthereumProvider();
        console.log('[FarcasterWallet] Provider obtained:', provider);

        // Inject the provider as window.ethereum (replacing any existing)
        if (typeof window !== 'undefined' && provider) {
          // @ts-ignore
          window.ethereum = provider;
          console.log('[FarcasterWallet] Injected provider as window.ethereum');
        }

        // Use injected connector (will pick up the Farcaster provider we just injected)
        const injectedConnector = connectors.find(c => c.id === 'injected');
        if (injectedConnector) {
          console.log('[FarcasterWallet] Connecting with injected connector...');
          connect({ connector: injectedConnector });
        } else {
          console.log('[FarcasterWallet] No injected connector found, available:', connectors.map(c => c.id));
        }
      } catch (err) {
        console.log('[FarcasterWallet] Error:', err);
      }
    };

    connectWallet();
  }, [isInMiniApp, isLoading, isConnected, connect, connectors]);

  return null;
}
