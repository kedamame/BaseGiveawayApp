'use client';

import { useEffect } from 'react';

export function FarcasterInit() {
  useEffect(() => {
    // Always try to call ready() - it's safe to call in browser too
    import('@farcaster/frame-sdk')
      .then((mod) => {
        mod.default.actions.ready();
        console.log('Farcaster SDK ready() called');
      })
      .catch((err) => {
        console.log('Farcaster SDK not available:', err);
      });
  }, []);

  return null;
}
