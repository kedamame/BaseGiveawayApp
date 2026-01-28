'use client';

// This component calls sdk.actions.ready() as early as possible
// to prevent white screen in Farcaster Mini App

if (typeof window !== 'undefined') {
  // Call ready() immediately when this module loads
  import('@farcaster/frame-sdk')
    .then((sdk) => {
      sdk.default.actions.ready();
    })
    .catch(() => {
      // Not in Farcaster environment, ignore
    });
}

export function FarcasterInit() {
  // This component doesn't render anything
  // It just ensures the module side effect runs
  return null;
}
