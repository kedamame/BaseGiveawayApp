import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

// Debug: Log if projectId is available
if (typeof window !== 'undefined') {
  console.log('[Wagmi] WalletConnect projectId configured:', !!projectId);
}

// Metadata for Web3Modal
export const metadata = {
  name: 'Giveaway App',
  description: 'Create and run fair token and NFT giveaways on Base',
  url: 'https://base-giveaway-app.vercel.app',
  icons: ['https://base-giveaway-app.vercel.app/icon.png'],
};

// Build connectors array
const connectors = [
  // Injected connector for Mini App (Farcaster wallet)
  injected({
    shimDisconnect: true,
  }),
  // Coinbase Wallet for web
  coinbaseWallet({
    appName: 'Giveaway App',
    preference: 'all',
  }),
];

// Only add WalletConnect if projectId is configured
if (projectId) {
  connectors.push(walletConnect({
    projectId,
    metadata,
    showQrModal: true, // Enable WalletConnect's own modal
  }));
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
