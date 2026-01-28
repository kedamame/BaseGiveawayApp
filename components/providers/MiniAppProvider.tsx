'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface MiniAppContextType {
  isInMiniApp: boolean;
  isReady: boolean;
}

const MiniAppContext = createContext<MiniAppContextType>({
  isInMiniApp: false,
  isReady: false,
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

  useEffect(() => {
    // Check if we're in Farcaster context (ready() is called by FarcasterInit)
    const checkContext = async () => {
      try {
        const sdk = await import('@farcaster/frame-sdk');
        const ctx = await sdk.default.context;
        if (ctx) {
          setIsInMiniApp(true);
        }
      } catch (e) {
        // Not in Farcaster environment
      } finally {
        setIsReady(true);
      }
    };

    checkContext();
  }, []);

  return (
    <MiniAppContext.Provider value={{ isInMiniApp, isReady }}>
      {children}
    </MiniAppContext.Provider>
  );
}
