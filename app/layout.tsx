import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/components/providers/AppProvider';
import { FarcasterInit } from '@/components/providers/FarcasterInit';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Mini App embed configuration
const miniAppEmbed = {
  version: '1',
  imageUrl: 'https://basegiveawayapp.vercel.app/icon.svg',
  button: {
    title: 'Create Giveaway',
    action: {
      type: 'launch_miniapp',
      name: 'Giveaway App',
      url: 'https://basegiveawayapp.vercel.app',
      splashImageUrl: 'https://basegiveawayapp.vercel.app/icon.svg',
      splashBackgroundColor: '#0A0B0D',
    },
  },
};

export const metadata: Metadata = {
  title: 'Giveaway App - Token & NFT Lottery on Base',
  description: 'Create and run fair token and NFT giveaways on Base. Weighted lottery, Farcaster integration, automatic distribution.',
  openGraph: {
    title: 'Giveaway App',
    description: 'Token & NFT Lottery on Base',
    type: 'website',
    images: ['/icon.svg'],
  },
  other: {
    'fc:miniapp': JSON.stringify(miniAppEmbed),
    'base:app_id': '6978dbae88e3bac59cf3db9e',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0052FF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FarcasterInit />
        <AppProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
