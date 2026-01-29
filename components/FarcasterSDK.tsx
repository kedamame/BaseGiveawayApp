'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface FarcasterSDKProps {
  children: ReactNode;
}

export function FarcasterSDK({ children }: FarcasterSDKProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initSDK = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');

        // Try to get context to check if we're in Mini App
        const context = await sdk.context;
        console.log('Farcaster Mini App context:', context);

        // Call ready() to dismiss splash screen
        sdk.actions.ready({});
        console.log('Farcaster SDK ready() called successfully');
      } catch (error) {
        // Not in Mini App context - this is fine, just log it
        console.log('Not in Farcaster Mini App context:', error);
      }
    };

    // Call immediately
    initSDK();
  }, []);

  return <>{children}</>;
}
