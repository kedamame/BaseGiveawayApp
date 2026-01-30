'use client';

import { useEffect, useRef } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { useFarcaster } from './FarcasterSDK';

export function FarcasterWalletConnect() {
  const { isInMiniApp, isLoading } = useFarcaster();
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const hasAttemptedConnect = useRef(false);

  useEffect(() => {
    const connectWallet = async () => {
      // Only try once, only in Mini App, only if not already connected
      if (hasAttemptedConnect.current || isLoading || !isInMiniApp || isConnected) {
        return;
      }
      hasAttemptedConnect.current = true;

      try {
        // Get the Farcaster wallet provider
        const provider = await sdk.wallet.getEthereumProvider();
        console.log('Farcaster wallet provider obtained:', provider);

        // Find the injected connector and connect
        const injectedConnector = connectors.find(c => c.id === 'injected');
        if (injectedConnector) {
          console.log('Connecting with injected connector...');
          connect({ connector: injectedConnector });
        } else {
          console.log('No injected connector found, available:', connectors.map(c => c.id));
        }
      } catch (error) {
        console.log('Farcaster wallet connection error:', error);
      }
    };

    connectWallet();
  }, [isInMiniApp, isLoading, isConnected, connect, connectors]);

  return null;
}
