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
      let sdk: typeof import('@farcaster/frame-sdk').default | null = null;

      try {
        // Dynamic import to avoid SSR issues
        const module = await import('@farcaster/frame-sdk');
        sdk = module.default;

        // Get context from Farcaster SDK
        try {
          const ctx = await sdk.context;
          if (ctx) {
            setIsInMiniApp(true);
          }
        } catch (contextError) {
          console.log('Not in Farcaster context:', contextError);
        }
      } catch (error) {
        console.error('Failed to load Farcaster SDK:', error);
      } finally {
        // Always call ready() to show the app, even if context fetch failed
        if (sdk) {
          try {
            sdk.actions.ready();
          } catch (readyError) {
            console.error('Failed to call ready():', readyError);
          }
        }
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
