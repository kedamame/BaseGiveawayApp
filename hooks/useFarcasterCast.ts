'use client';

import { useState } from 'react';

interface CastParticipant {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  address?: string;
  hasLiked: boolean;
  hasRecast: boolean;
}

export function useFarcasterCast() {
  const [participants, setParticipants] = useState<CastParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async (castUrl: string) => {
    if (!castUrl.trim()) {
      setError('Cast URL is required');
      return;
    }

    setLoading(true);
    setError(null);
    setParticipants([]);

    try {
      const res = await fetch('/api/cast/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ castUrl: castUrl.trim() }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setParticipants(data.participants || []);
      }
    } catch (err) {
      setError('Failed to fetch cast participants');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredParticipants = (filter: 'all' | 'likes' | 'recasts') => {
    if (filter === 'likes') {
      return participants.filter((p) => p.hasLiked);
    }
    if (filter === 'recasts') {
      return participants.filter((p) => p.hasRecast);
    }
    return participants;
  };

  const getParticipantsWithAddress = () => {
    return participants.filter((p) => p.address);
  };

  const clearParticipants = () => {
    setParticipants([]);
    setError(null);
  };

  return {
    participants,
    loading,
    error,
    fetchParticipants,
    getFilteredParticipants,
    getParticipantsWithAddress,
    clearParticipants,
  };
}
