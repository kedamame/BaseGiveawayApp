'use client';

import { useSignIn, StatusAPIResponse } from '@farcaster/auth-kit';
import { useCallback, useState, useEffect } from 'react';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
}

export function FarcasterLogin() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSuccess = useCallback((res: StatusAPIResponse) => {
    if (res.fid) {
      setUser({
        fid: res.fid,
        username: res.username || '',
        displayName: res.displayName || res.username || '',
        pfpUrl: res.pfpUrl,
      });
    }
  }, []);

  const {
    signIn,
    signOut,
    isSuccess,
    isError,
    isPolling,
  } = useSignIn({
    onSuccess: handleSuccess,
  });

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setShowDropdown(false);
  };

  // Show placeholder during hydration
  if (!mounted) {
    return (
      <button
        disabled
        className="flex items-center gap-2 py-2 px-3 bg-purple-600 rounded-xl text-sm font-medium opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.24 0.24H5.76C2.58 0.24 0 2.82 0 6v12c0 3.18 2.58 5.76 5.76 5.76h12.48c3.18 0 5.76-2.58 5.76-5.76V6c0-3.18-2.58-5.76-5.76-5.76zM6 18V6h2.4v12H6zm4.8 0V6h2.4v12h-2.4zm4.8 0V6H18v12h-2.4z" />
        </svg>
        Farcaster
      </button>
    );
  }

  if (isSuccess && user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 py-2 px-3 bg-base-gray-800 hover:bg-base-gray-700 rounded-xl transition-colors"
        >
          {user.pfpUrl ? (
            <img
              src={user.pfpUrl}
              alt={user.displayName}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">{user.displayName.charAt(0)}</span>
            </div>
          )}
          <span className="text-sm font-medium">@{user.username}</span>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-base-gray-800 border border-base-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-base-gray-700">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-base-gray-400">FID: {user.fid}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 text-left text-sm hover:bg-base-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      disabled={isPolling}
      className="flex items-center gap-2 py-2 px-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
    >
      {isPolling ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.24 0.24H5.76C2.58 0.24 0 2.82 0 6v12c0 3.18 2.58 5.76 5.76 5.76h12.48c3.18 0 5.76-2.58 5.76-5.76V6c0-3.18-2.58-5.76-5.76-5.76zM6 18V6h2.4v12H6zm4.8 0V6h2.4v12h-2.4zm4.8 0V6H18v12h-2.4z" />
        </svg>
      )}
      {isPolling ? 'Signing in...' : 'Farcaster'}
    </button>
  );
}
