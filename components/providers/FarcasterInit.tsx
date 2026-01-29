'use client';

import { useEffect } from 'react';

export function FarcasterInit() {
  useEffect(() => {
    const init = async () => {
      try {
        const sdk = (await import('@farcaster/frame-sdk')).default;
        await sdk.actions.ready();
      } catch (e) {
        // Silently fail - not in Farcaster environment
      }
    };
    init();
  }, []);

  return null;
}
