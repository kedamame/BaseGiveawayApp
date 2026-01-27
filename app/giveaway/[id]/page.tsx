'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Giveaway, Participant } from '@/types';

export default function GiveawayDetail() {
  const params = useParams();
  const id = params.id as string;

  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGiveaway();
  }, [id]);

  const fetchGiveaway = async () => {
    try {
      const res = await fetch(`/api/giveaway/${id}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setGiveaway(data.giveaway);
        setParticipants(data.participants || []);
      }
    } catch (err) {
      setError('Failed to load giveaway');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'drawn':
        return 'bg-blue-500/20 text-blue-500';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-base-gray-500/20 text-base-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin mx-auto text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-base-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !giveaway) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Giveaway Not Found</h2>
          <p className="text-base-gray-400 mb-4">{error || 'The requested giveaway could not be found.'}</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const winners = participants.filter((p) => p.is_winner);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-base-gray-800 bg-base-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/giveaway/history" className="text-base-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold">Giveaway Details</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className="card">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(giveaway.status)}`}>
                {giveaway.status.charAt(0).toUpperCase() + giveaway.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-base-gray-400">
              {formatDate(giveaway.created_at)}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-base-gray-400">Type</span>
              <span className="font-medium">{giveaway.asset_type.toUpperCase()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-base-gray-400">Contract</span>
              <a
                href={`https://basescan.org/address/${giveaway.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-base-blue hover:underline"
              >
                {formatAddress(giveaway.contract_address)}
              </a>
            </div>

            {giveaway.asset_type === 'token' && giveaway.amount && (
              <div className="flex justify-between">
                <span className="text-base-gray-400">Amount</span>
                <span className="font-medium">{giveaway.amount}</span>
              </div>
            )}

            {giveaway.asset_type === 'nft' && giveaway.token_id && (
              <div className="flex justify-between">
                <span className="text-base-gray-400">Token ID</span>
                <span className="font-medium">{giveaway.token_id}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-base-gray-400">Winners</span>
              <span className="font-medium">{giveaway.winner_count}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-base-gray-400">Auto Transfer</span>
              <span className="font-medium">{giveaway.auto_transfer ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Winners */}
        {winners.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
              </svg>
              Winners ({winners.length})
            </h3>

            <div className="space-y-2">
              {winners.map((winner, index) => (
                <div
                  key={winner.id}
                  className="flex items-center gap-3 bg-base-gray-800 rounded-lg p-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{winner.original_input}</p>
                    <p className="text-sm text-base-gray-400">{formatAddress(winner.address)}</p>
                  </div>
                  <span className="text-sm text-base-gray-500">w:{winner.weight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Participants */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            All Participants ({participants.length})
          </h3>

          {participants.length === 0 ? (
            <p className="text-base-gray-400 text-center py-4">No participants</p>
          ) : (
            <div className="max-h-64 overflow-auto space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 rounded-lg p-3 ${
                    participant.is_winner
                      ? 'bg-yellow-500/10 border border-yellow-500/20'
                      : 'bg-base-gray-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{participant.original_input}</p>
                      {participant.is_winner && (
                        <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs">
                          Winner
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-base-gray-400">{formatAddress(participant.address)}</p>
                  </div>
                  <span className="text-sm text-base-gray-500">w:{participant.weight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
