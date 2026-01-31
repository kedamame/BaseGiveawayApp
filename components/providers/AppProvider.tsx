'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useReconnect } from 'wagmi';
import { config } from '@/lib/wagmi';
import { FarcasterSDK } from '@/components/FarcasterSDK';
import { FarcasterWalletConnect } from '@/components/FarcasterWalletConnect';

interface AppProviderProps {
  children: ReactNode;
}

// Component to handle reconnection on mount
function WagmiReconnect() {
  const { reconnect } = useReconnect();

  useEffect(() => {
    console.log('[WagmiReconnect] Attempting to reconnect...');
    reconnect();
  }, [reconnect]);

  return null;
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

  return (
    <FarcasterSDK>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <WagmiReconnect />
          <FarcasterWalletConnect />
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </FarcasterSDK>
  );
}
