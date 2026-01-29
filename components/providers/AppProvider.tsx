'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { config } from '@/lib/wagmi';
import { useState, useEffect, type ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

const authKitConfig = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: typeof window !== 'undefined' ? window.location.host : '',
  siweUri: typeof window !== 'undefined' ? window.location.origin : '',
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  // Call ready() to hide splash screen - must be in useEffect
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthKitProvider config={authKitConfig}>
          {children}
        </AuthKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
