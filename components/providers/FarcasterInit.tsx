'use client';

import { useEffect } from 'react';

export function FarcasterInit() {
  useEffect(() => {
    // Only run in iframe (Mini App context)
    if (typeof window !== 'undefined' && window !== window.parent) {
      import('@farcaster/frame-sdk')
        .then((mod) => {
          mod.default.actions.ready();
        })
        .catch(() => {
          // Ignore errors
        });
    }
  }, []);

  return null;
}
