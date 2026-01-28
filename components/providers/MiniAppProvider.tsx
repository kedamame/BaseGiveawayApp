'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Types for Farcaster Mini App
interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface MiniAppContext {
  user?: FarcasterUser;
}

interface FarcasterSDK {
  context: MiniAppContext;
  actions: {
    ready: () => void;
    openUrl: (url: string) => void;
    close: () => void;
  };
  wallet: {
    ethProvider: unknown;
  };
}

declare global {
  interface Window {
    farcaster?: FarcasterSDK;
  }
}

interface MiniAppContextType {
  isInMiniApp: boolean;
  isReady: boolean;
  context: MiniAppContext | null;
  sdk: FarcasterSDK | null;
}

const MiniAppContext = createContext<MiniAppContextType>({
  isInMiniApp: false,
  isReady: false,
  context: null,
  sdk: null,
});

export function useMiniApp() {
  return useContext(MiniAppContext);
}

interface MiniAppProviderProps {
  children: ReactNode;
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [sdk, setSdk] = useState<FarcasterSDK | null>(null);

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        // Check if Farcaster SDK is available (running inside Farcaster client)
        if (typeof window !== 'undefined' && window.farcaster) {
          setIsInMiniApp(true);
          setSdk(window.farcaster);

          // Safely access context
          if (window.farcaster.context) {
            setContext(window.farcaster.context);
          }

          // Signal that the app is ready (with delay to ensure SDK is loaded)
          setTimeout(() => {
            try {
              if (window.farcaster?.actions?.ready) {
                window.farcaster.actions.ready();
              }
            } catch (e) {
              console.error('Failed to call ready:', e);
            }
          }, 100);
        }
      } catch (error) {
        console.error('Failed to initialize Mini App:', error);
      } finally {
        setIsReady(true);
      }
    };

    // Small delay to ensure window.farcaster is available
    const timer = setTimeout(initMiniApp, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MiniAppContext.Provider value={{ isInMiniApp, isReady, context, sdk }}>
      {children}
    </MiniAppContext.Provider>
  );
}
