'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { Token } from '@/types';

export function useTokens() {
  const { address } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchTokens();
    } else {
      setTokens([]);
    }
  }, [address]);

  const fetchTokens = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tokens?address=${address}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setTokens(data.tokens || []);
      }
    } catch (err) {
      setError('Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  };

  return {
    tokens,
    loading,
    error,
    refetch: fetchTokens,
  };
}
