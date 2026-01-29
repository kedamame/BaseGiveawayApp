'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { WalletConnect } from '@/components/auth/WalletConnect';

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Signal that the app is ready to be displayed
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-base-gray-800 bg-base-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-base-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-lg">Giveaway</span>
          </div>
          <div className="flex items-center gap-3">
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-base-blue bg-clip-text text-transparent">
            Token & NFT Giveaway
          </h1>
          <p className="text-base-gray-400 text-lg mb-8">
            Create fair weighted lotteries for your community.
            Import participants from Farcaster casts, CSV, or manual entry.
          </p>

          {!mounted ? (
            <div className="h-12 w-48 bg-base-gray-800 rounded-xl animate-pulse" />
          ) : isConnected ? (
            <Link href="/giveaway/create" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Giveaway
            </Link>
          ) : (
            <div className="card max-w-sm mx-auto relative z-[60]">
              <p className="text-base-gray-300 mb-4">Connect your wallet to get started</p>
              <WalletConnect />
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
          <div className="card">
            <div className="w-12 h-12 bg-base-blue/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Token & NFT Support</h3>
            <p className="text-base-gray-400 text-sm">
              Distribute ERC20 tokens or NFTs (ERC721/ERC1155) to lottery winners.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-base-blue/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Farcaster Integration</h3>
            <p className="text-base-gray-400 text-sm">
              Collect participants from cast reactions - likes and recasts.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-base-blue/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Weighted Lottery</h3>
            <p className="text-base-gray-400 text-sm">
              Assign custom weights to participants for fair distribution chances.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-base-gray-800 py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-base-gray-500 text-sm">
            Built on Base
          </p>
          <div className="flex items-center gap-4">
            <Link href="/giveaway/history" className="text-base-gray-400 hover:text-white text-sm transition-colors">
              History
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
