'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { NFT } from '@/types';

export function useNfts() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchNfts();
    } else {
      setNfts([]);
    }
  }, [address]);

  const fetchNfts = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/nfts?address=${address}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setNfts(data.nfts || []);
      }
    } catch (err) {
      setError('Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  };

  return {
    nfts,
    loading,
    error,
    refetch: fetchNfts,
  };
}
