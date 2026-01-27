'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import type { Giveaway, Participant, ParticipantInput } from '@/types';

export function useGiveaway() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGiveaway = async (params: {
    assetType: 'token' | 'nft';
    contractAddress: string;
    tokenId?: string;
    amount?: string;
    winnerCount: number;
    autoTransfer: boolean;
    participants: ParticipantInput[];
  }): Promise<string | null> => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/giveaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorAddress: address.toLowerCase(),
          assetType: params.assetType,
          contractAddress: params.contractAddress,
          tokenId: params.tokenId,
          amount: params.amount,
          winnerCount: params.winnerCount,
          autoTransfer: params.autoTransfer,
          participants: params.participants.map((p) => ({
            address: p.resolvedAddress,
            inputType: p.inputType,
            originalInput: p.input,
            weight: p.weight,
          })),
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return null;
      }

      return data.id;
    } catch (err) {
      setError('Failed to create giveaway');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getGiveaway = async (id: string): Promise<{
    giveaway: Giveaway;
    participants: Participant[];
  } | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/giveaway/${id}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return null;
      }

      return {
        giveaway: data.giveaway,
        participants: data.participants,
      };
    } catch (err) {
      setError('Failed to fetch giveaway');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateGiveaway = async (
    id: string,
    params: {
      winners?: string[];
      status?: string;
    }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/giveaway/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return false;
      }

      return true;
    } catch (err) {
      setError('Failed to update giveaway');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteGiveaway = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/giveaway/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return false;
      }

      return true;
    } catch (err) {
      setError('Failed to delete giveaway');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createGiveaway,
    getGiveaway,
    updateGiveaway,
    deleteGiveaway,
    loading,
    error,
  };
}
