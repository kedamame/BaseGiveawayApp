import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

// Build connectors array conditionally
const connectors = [
  coinbaseWallet({
    appName: 'Giveaway App',
    preference: 'all', // Changed from smartWalletOnly to support all Coinbase wallets
  }),
  injected(),
];

// Only add WalletConnect if projectId is configured
if (projectId) {
  connectors.push(walletConnect({ projectId }));
}

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
