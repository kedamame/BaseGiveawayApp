'use client';

import { useState } from 'react';
import type { ParticipantInput } from '@/types';

interface CastParticipant {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  address?: string;
  hasLiked: boolean;
  hasRecast: boolean;
}

interface CastCollectorProps {
  onImport: (participants: ParticipantInput[]) => void;
}

export function CastCollector({ onImport }: CastCollectorProps) {
  const [castUrl, setCastUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CastParticipant[]>([]);
  const [filter, setFilter] = useState<'all' | 'likes' | 'recasts'>('all');

  const handleFetch = async () => {
    if (!castUrl.trim()) return;

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

  const filteredParticipants = participants.filter((p) => {
    if (filter === 'likes') return p.hasLiked;
    if (filter === 'recasts') return p.hasRecast;
    return true;
  });

  const handleImport = () => {
    const toImport: ParticipantInput[] = filteredParticipants
      .filter((p) => p.address)
      .map((p) => ({
        input: `@${p.username}`,
        inputType: 'farcaster' as const,
        weight: (p.hasLiked && p.hasRecast) ? 2 : 1, // Bonus weight for both actions
        resolvedAddress: p.address,
      }));

    if (toImport.length === 0) {
      setError('No participants with verified addresses found');
      return;
    }

    onImport(toImport);
    setParticipants([]);
    setCastUrl('');
  };

  return (
    <div className="space-y-4">
      {/* Cast URL Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={castUrl}
            onChange={(e) => setCastUrl(e.target.value)}
            placeholder="https://warpcast.com/username/0x..."
            className="input flex-1"
            disabled={loading}
          />
          <button
            onClick={handleFetch}
            disabled={!castUrl.trim() || loading}
            className="btn-primary px-4"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Fetch'
            )}
          </button>
        </div>

        <p className="text-xs text-base-gray-500">
          Enter a Warpcast URL to collect participants from likes and recasts
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {participants.length > 0 && (
        <div className="space-y-3">
          {/* Filter */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-base-blue text-white'
                    : 'bg-base-gray-800 text-base-gray-400 hover:bg-base-gray-700'
                }`}
              >
                All ({participants.length})
              </button>
              <button
                onClick={() => setFilter('likes')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filter === 'likes'
                    ? 'bg-base-blue text-white'
                    : 'bg-base-gray-800 text-base-gray-400 hover:bg-base-gray-700'
                }`}
              >
                Likes ({participants.filter((p) => p.hasLiked).length})
              </button>
              <button
                onClick={() => setFilter('recasts')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filter === 'recasts'
                    ? 'bg-base-blue text-white'
                    : 'bg-base-gray-800 text-base-gray-400 hover:bg-base-gray-700'
                }`}
              >
                Recasts ({participants.filter((p) => p.hasRecast).length})
              </button>
            </div>

            <button
              onClick={handleImport}
              className="btn-primary py-1 px-3 text-sm"
            >
              Import {filteredParticipants.filter((p) => p.address).length}
            </button>
          </div>

          {/* Participant List */}
          <div className="max-h-64 overflow-auto space-y-2">
            {filteredParticipants.map((participant) => (
              <div
                key={participant.fid}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  participant.address ? 'bg-base-gray-800' : 'bg-base-gray-800/50 opacity-60'
                }`}
              >
                {participant.pfpUrl ? (
                  <img
                    src={participant.pfpUrl}
                    alt={participant.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {participant.displayName.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{participant.displayName}</p>
                  <p className="text-xs text-base-gray-500">@{participant.username}</p>
                </div>

                <div className="flex gap-1">
                  {participant.hasLiked && (
                    <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs">
                      Like
                    </span>
                  )}
                  {participant.hasRecast && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                      Recast
                    </span>
                  )}
                </div>

                {!participant.address && (
                  <span className="text-xs text-yellow-500" title="No verified address">
                    No wallet
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-base-gray-500 text-center">
            Participants with both like and recast get 2x weight
          </p>
        </div>
      )}
    </div>
  );
}
