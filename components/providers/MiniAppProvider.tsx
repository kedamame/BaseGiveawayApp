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
    const initMiniApp = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { default: sdk } = await import('@farcaster/frame-sdk');

        // Get context from Farcaster SDK
        const ctx = await sdk.context;

        if (ctx) {
          setIsInMiniApp(true);
        }

        // Always call ready() to show the app
        sdk.actions.ready();
      } catch (error) {
        console.error('Failed to initialize Mini App:', error);
      } finally {
        setIsReady(true);
      }
    };

    initMiniApp();
  }, []);

  return (
    <MiniAppContext.Provider value={{ isInMiniApp, isReady }}>
      {children}
    </MiniAppContext.Provider>
  );
}
