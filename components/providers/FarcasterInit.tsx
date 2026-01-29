'use client';

import { useEffect, useRef } from 'react';

export function FarcasterInit() {
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return;
    initialized.current = true;

    // Call ready() immediately to prevent timeout
    const initSDK = async () => {
      try {
        const sdk = await import('@farcaster/frame-sdk');
        // Call ready() as soon as SDK is loaded
        await sdk.default.actions.ready();
        console.log('Farcaster SDK ready() called successfully');
      } catch (err) {
        // Not in Farcaster context - this is fine
        console.log('Farcaster SDK not available (not in Mini App context)');
      }
    };

    // Start initialization immediately
    initSDK();
  }, []);

  return null;
}
