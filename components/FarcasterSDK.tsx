'use client';

import { useEffect, useState, type ReactNode, createContext, useContext } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

// Detected platform
type Platform = 'farcaster' | 'base-app' | 'web';

// Context to share Mini App state
interface FarcasterContextType {
  isInMiniApp: boolean;
  isInBaseApp: boolean;
  platform: Platform;
  isLoading: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isInMiniApp: false,
  isInBaseApp: false,
  platform: 'web',
  isLoading: true,
});

export const useFarcaster = () => useContext(FarcasterContext);

interface FarcasterSDKProps {
  children: ReactNode;
}

// Detect if running inside Coinbase Wallet in-app browser (Base App).
// Distinguished from the Coinbase Wallet browser extension by checking
// that the provider is the *sole* injected provider (no providers array)
// and that we are NOT running in an iframe (which would indicate Farcaster).
function detectBaseApp(): boolean {
  if (typeof window === 'undefined') return false;
  // In-app browsers don't run inside iframes
  if (window !== window.top) return false;
  const ethereum = (window as any).ethereum;
  if (!ethereum) return false;
  // Coinbase Wallet in-app browser injects a single provider directly
  if (ethereum.isCoinbaseWallet && !ethereum.isMetaMask) {
    // Browser extension exposes a providers array alongside other wallets
    if (Array.isArray(ethereum.providers)) return false;
    return true;
  }
  return false;
}

export function FarcasterSDK({ children }: FarcasterSDKProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isInBaseApp, setIsInBaseApp] = useState(false);
  const [platform, setPlatform] = useState<Platform>('web');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Check Farcaster Mini App
        const isMiniApp = await sdk.isInMiniApp();
        console.log('[MiniApp] Is in Farcaster Mini App:', isMiniApp);
        setIsInMiniApp(isMiniApp);

        if (isMiniApp) {
          setPlatform('farcaster');
          const context = await sdk.context;
          console.log('[MiniApp] Farcaster context:', context);
          sdk.actions.ready({});
          console.log('[MiniApp] Farcaster SDK ready() called');
        } else {
          // 2. Check Base App (Coinbase Wallet browser)
          const baseApp = detectBaseApp();
          console.log('[MiniApp] Is in Base App:', baseApp);
          setIsInBaseApp(baseApp);

          if (baseApp) {
            setPlatform('base-app');
            console.log('[MiniApp] Running inside Base App / Coinbase Wallet');
          } else {
            setPlatform('web');
            console.log('[MiniApp] Running as standalone web app');
          }
        }
      } catch (error) {
        console.log('[MiniApp] SDK error:', error);
        // Still check for Base App even if Farcaster SDK fails
        const baseApp = detectBaseApp();
        setIsInBaseApp(baseApp);
        setPlatform(baseApp ? 'base-app' : 'web');
        try {
          sdk.actions.ready({});
        } catch (e) {
          // Ignore
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <FarcasterContext.Provider value={{ isInMiniApp, isInBaseApp, platform, isLoading }}>
      {children}
    </FarcasterContext.Provider>
  );
}
