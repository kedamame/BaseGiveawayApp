'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import sdk, { type Context } from '@farcaster/frame-sdk';

interface MiniAppContextType {
  isInMiniApp: boolean;
  isReady: boolean;
  context: Context.FrameContext | null;
  isLoaded: boolean;
}

const MiniAppContext = createContext<MiniAppContextType>({
  isInMiniApp: false,
  isReady: false,
  context: null,
  isLoaded: false,
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
  const [context, setContext] = useState<Context.FrameContext | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const initMiniApp = useCallback(async () => {
    try {
      // Get context from Farcaster SDK
      const ctx = await sdk.context;

      if (ctx) {
        setIsInMiniApp(true);
        setContext(ctx);
      }
    } catch (error) {
      console.error('Failed to get Farcaster context:', error);
    } finally {
      // Always call ready() to show the app, even if not in Farcaster
      sdk.actions.ready();
      setIsReady(true);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    initMiniApp();
  }, [initMiniApp]);

  // Don't render children until loaded to prevent flash
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-black">
        <div className="w-8 h-8 border-4 border-base-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <MiniAppContext.Provider value={{ isInMiniApp, isReady, context, isLoaded }}>
      {children}
    </MiniAppContext.Provider>
  );
}
