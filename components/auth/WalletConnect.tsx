'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useFarcaster } from '@/components/FarcasterSDK';
import { sdk } from '@farcaster/miniapp-sdk';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error, reset } = useConnect();
  const { disconnect } = useDisconnect();
  const { isInMiniApp } = useFarcaster();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Filter connectors - hide generic 'injected' to avoid conflicts with browser extensions
  // We'll add Farcaster wallet as a special option in Mini App
  const filteredConnectors = connectors.filter(c => c.id !== 'injected');

  // Connect with Farcaster wallet (for Mini App)
  const connectFarcasterWallet = useCallback(async () => {
    console.log('[WalletConnect] Connecting Farcaster wallet...');
    try {
      const provider = await sdk.wallet.getEthereumProvider();
      if (typeof window !== 'undefined' && provider) {
        // @ts-ignore
        window.ethereum = provider;
        console.log('[WalletConnect] Farcaster provider injected');
      }
      const injectedConnector = connectors.find(c => c.id === 'injected');
      if (injectedConnector) {
        setShowDropdown(false);
        connect({ connector: injectedConnector });
      }
    } catch (err) {
      console.error('[WalletConnect] Farcaster wallet error:', err);
    }
  }, [connectors, connect]);

  // Debug logging
  useEffect(() => {
    console.log('[WalletConnect] isInMiniApp:', isInMiniApp);
    console.log('[WalletConnect] All connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
    console.log('[WalletConnect] Filtered connectors:', filteredConnectors.map(c => ({ id: c.id, name: c.name })));
  }, [isInMiniApp, connectors, filteredConnectors]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown and reset on successful connection
  useEffect(() => {
    if (isConnected) {
      setShowDropdown(false);
      reset();
    }
  }, [isConnected, reset]);

  // Log error but don't reset immediately - let user see the error
  useEffect(() => {
    if (error) {
      console.error('Connection error:', error);
      // Delay reset to allow the connection process to complete
      const timer = setTimeout(() => {
        reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, reset]);

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Show placeholder during hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className="relative">
        <button
          disabled
          className="btn-primary py-2 px-4 flex items-center gap-2 opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Connect
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative z-[60]">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn-secondary flex items-center gap-2 py-2 px-4"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          {formatAddress(address)}
        </button>

        {showDropdown && (
          <>
            {createPortal(
              <div
                className="fixed inset-0 z-[9998] bg-black/20 cursor-pointer"
                onClick={() => setShowDropdown(false)}
                aria-hidden="true"
              />,
              document.body
            )}
            <div className="absolute right-0 mt-2 w-48 bg-base-gray-800 border border-base-gray-700 rounded-xl shadow-lg z-[9999] overflow-hidden">
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-3 text-left text-sm hover:bg-base-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative z-[60]">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isPending}
        className="btn-primary py-2 px-4 flex items-center gap-2"
      >
        {isPending ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )}
        {isPending ? 'Connecting...' : 'Connect'}
      </button>

      {showDropdown && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/20"
            onClick={() => setShowDropdown(false)}
          />
          <div className="fixed top-16 right-4 w-64 bg-base-gray-800 border border-base-gray-700 rounded-xl shadow-lg z-[9999] overflow-hidden">
            <div className="p-3 border-b border-base-gray-700">
              <p className="text-sm text-base-gray-400">Connect Wallet</p>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {/* Farcaster Wallet - shown in Mini App */}
              {isInMiniApp && (
                <button
                  onClick={connectFarcasterWallet}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-base-gray-700 rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 32 32" className="w-5 h-5">
                      <rect width="32" height="32" rx="6" fill="#8B5CF6"/>
                      <path d="M8 10h16v2H8v-2zm0 5h16v2H8v-2zm0 5h10v2H8v-2z" fill="white"/>
                    </svg>
                  </div>
                  <span>Farcaster Wallet</span>
                </button>
              )}
              {filteredConnectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    console.log('[WalletConnect] Button clicked!');
                    console.log('[WalletConnect] Attempting to connect with:', connector.id, connector.name);
                    setShowDropdown(false);
                    connect({ connector });
                  }}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-base-gray-700 rounded-lg transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-base-gray-600 rounded-lg flex items-center justify-center">
                    {connector.id === 'coinbaseWalletSDK' ? (
                      <svg viewBox="0 0 32 32" className="w-5 h-5">
                        <circle cx="16" cy="16" r="16" fill="#0052FF"/>
                        <path d="M16 6C10.48 6 6 10.48 6 16s4.48 10 10 10 10-4.48 10-10S21.52 6 16 6zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="white"/>
                      </svg>
                    ) : connector.id === 'walletConnect' ? (
                      <svg viewBox="0 0 32 32" className="w-5 h-5">
                        <rect width="32" height="32" rx="6" fill="#3B99FC"/>
                        <path d="M10.5 12.5c3-3 8-3 11 0l.4.4c.1.1.1.3 0 .5l-1.3 1.3c-.1.1-.2.1-.3 0l-.5-.5c-2.1-2.1-5.5-2.1-7.6 0l-.5.5c-.1.1-.2.1-.3 0l-1.3-1.3c-.1-.2-.1-.4 0-.5l.4-.4zm13.6 2.5l1.2 1.2c.1.2.1.4 0 .5l-5.4 5.4c-.2.2-.4.2-.5 0l-3.8-3.8c0-.1-.1-.1-.2 0l-3.8 3.8c-.2.2-.4.2-.5 0l-5.4-5.4c-.1-.1-.1-.3 0-.5l1.2-1.2c.2-.1.4-.1.5 0l3.8 3.8c0 .1.1.1.2 0l3.8-3.8c.2-.2.4-.2.5 0l3.8 3.8c.1.1.2.1.2 0l3.8-3.8c.2-.1.4-.1.6 0z" fill="white"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-base-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                  </div>
                  <span>{connector.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
