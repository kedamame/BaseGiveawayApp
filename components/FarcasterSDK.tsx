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
        // First check if we're actually in a Mini App environment
        const isMiniApp = await sdk.isInMiniApp();
        console.log('Is in Mini App:', isMiniApp);

        if (isMiniApp) {
          // Get context
          const context = await sdk.context;
          console.log('Farcaster Mini App context:', context);

          // Signal that the app is ready - this hides the splash screen
          sdk.actions.ready({});
          console.log('Farcaster SDK ready() called');
        } else {
          console.log('Not in Farcaster Mini App - skipping SDK initialization');
        }
      } catch (error) {
        console.log('Farcaster SDK error:', error);
        // Still try to call ready() in case we are in Mini App but had an error
        try {
          sdk.actions.ready({});
        } catch (e) {
          // Ignore
        }
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
