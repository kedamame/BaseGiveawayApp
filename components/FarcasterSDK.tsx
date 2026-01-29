'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterSDKProps {
  children: ReactNode;
}

export function FarcasterSDK({ children }: FarcasterSDKProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Get context first (this tells us if we're in a Mini App)
        const context = await sdk.context;
        console.log('Farcaster Mini App context:', context);
      } catch (error) {
        console.log('Not in Farcaster Mini App context:', error);
      }

      // Always signal that the app is ready - this hides the splash screen
      // Call this even if context fails, in case we're in a Mini App but context had an issue
      try {
        sdk.actions.ready({});
        console.log('Farcaster SDK ready() called');
      } catch (error) {
        console.log('Failed to call ready():', error);
      }
    };

    // Only run once
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return <>{children}</>;
}
