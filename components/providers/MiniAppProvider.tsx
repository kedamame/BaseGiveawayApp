'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface MiniAppContextType {
  isInMiniApp: boolean;
  isSDKLoaded: boolean;
}

const MiniAppContext = createContext<MiniAppContextType>({
  isInMiniApp: false,
  isSDKLoaded: false,
});

export function useMiniApp() {
  return useContext(MiniAppContext);
}

interface MiniAppProviderProps {
  children: ReactNode;
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Get context to check if we're in Mini App
        const context = await sdk.context;
        if (context) {
          setIsInMiniApp(true);
        }
      } catch (e) {
        // Not in Mini App context
      }
      // Always call ready() to hide splash screen
      sdk.actions.ready();
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <MiniAppContext.Provider value={{ isInMiniApp, isSDKLoaded }}>
      {children}
    </MiniAppContext.Provider>
  );
}
