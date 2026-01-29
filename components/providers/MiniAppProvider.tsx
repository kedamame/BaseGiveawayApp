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
    // Check if we're in an iframe (Mini App runs in iframe)
    const isIframe = typeof window !== 'undefined' && window !== window.parent;
    setIsInMiniApp(isIframe);
    setIsReady(true);
  }, []);

  return (
    <MiniAppContext.Provider value={{ isInMiniApp, isReady }}>
      {children}
    </MiniAppContext.Provider>
  );
}
