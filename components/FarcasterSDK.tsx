'use client';

import { useEffect, useState, type ReactNode, createContext, useContext } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

// Context to share Mini App state
interface FarcasterContextType {
  isInMiniApp: boolean;
  isLoading: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isInMiniApp: false,
  isLoading: true,
});

export const useFarcaster = () => useContext(FarcasterContext);

interface FarcasterSDKProps {
  children: ReactNode;
}

export function FarcasterSDK({ children }: FarcasterSDKProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // First check if we're actually in a Mini App environment
        const isMiniApp = await sdk.isInMiniApp();
        console.log('Is in Mini App:', isMiniApp);
        setIsInMiniApp(isMiniApp);

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
      } finally {
        setIsLoading(false);
      }
    };

    // Only run once
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <FarcasterContext.Provider value={{ isInMiniApp, isLoading }}>
      {children}
    </FarcasterContext.Provider>
  );
}
