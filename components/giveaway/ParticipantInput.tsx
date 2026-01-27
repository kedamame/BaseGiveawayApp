'use client';

import { useState } from 'react';
import type { ParticipantInput as ParticipantInputType } from '@/types';

interface ParticipantInputProps {
  participants: ParticipantInputType[];
  onAddParticipant: (participant: ParticipantInputType) => void;
  onRemoveParticipant: (index: number) => void;
  onUpdateWeight: (index: number, weight: number) => void;
}

export function ParticipantInput({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onUpdateWeight,
}: ParticipantInputProps) {
  const [input, setInput] = useState('');
  const [weight, setWeight] = useState(1);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectInputType = (value: string): 'address' | 'basename' | 'ens' | 'farcaster' => {
    const trimmed = value.trim().toLowerCase();
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return 'address';
    if (trimmed.startsWith('@')) return 'farcaster';
    if (trimmed.endsWith('.base.eth')) return 'basename';
    if (trimmed.endsWith('.eth')) return 'ens';
    return 'farcaster'; // Default to farcaster username
  };

  const handleAdd = async () => {
    if (!input.trim()) return;

    setResolving(true);
    setError(null);

    try {
      const inputType = detectInputType(input);
      let resolvedAddress: string | undefined;

      if (inputType === 'address') {
        resolvedAddress = input.trim().toLowerCase();
      } else {
        // Resolve via API
        const res = await fetch('/api/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: input.trim() }),
        });

        const data = await res.json();
        if (data.error) {
          setError(data.error);
          setResolving(false);
          return;
        }
        resolvedAddress = data.address;
      }

      if (!resolvedAddress) {
        setError('Could not resolve address');
        setResolving(false);
        return;
      }

      // Check for duplicates
      const exists = participants.some(
        (p) => p.resolvedAddress?.toLowerCase() === resolvedAddress?.toLowerCase()
      );

      if (exists) {
        setError('This address is already added');
        setResolving(false);
        return;
      }

      onAddParticipant({
        input: input.trim(),
        inputType,
        weight,
        resolvedAddress,
      });

      setInput('');
      setWeight(1);
    } catch (err) {
      setError('Failed to resolve address');
    } finally {
      setResolving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getInputIcon = (type: string) => {
    switch (type) {
      case 'address':
        return '0x';
      case 'basename':
        return 'B';
      case 'ens':
        return 'ENS';
      case 'farcaster':
        return 'FC';
      default:
        return '?';
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Address, ENS, Basename, or @farcaster"
            className="input flex-1"
            disabled={resolving}
          />
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="input w-20 text-center"
            title="Weight"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim() || resolving}
            className="btn-primary px-4 disabled:opacity-50"
          >
            {resolving ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <p className="text-xs text-base-gray-500">
          Supports ETH addresses, ENS names, Basenames (.base.eth), and Farcaster usernames (@username)
        </p>
      </div>

      {/* Participants List */}
      {participants.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-base-gray-300">
              Participants ({participants.length})
            </p>
            <p className="text-xs text-base-gray-500">
              Total weight: {participants.reduce((sum, p) => sum + p.weight, 0)}
            </p>
          </div>

          <div className="max-h-64 overflow-auto space-y-2">
            {participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-base-gray-800 rounded-lg p-3"
              >
                <div className="w-8 h-8 bg-base-gray-700 rounded-lg flex items-center justify-center text-xs font-bold text-base-gray-400">
                  {getInputIcon(participant.inputType)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{participant.input}</p>
                  {participant.resolvedAddress && participant.inputType !== 'address' && (
                    <p className="text-xs text-base-gray-500">
                      {formatAddress(participant.resolvedAddress)}
                    </p>
                  )}
                </div>

                <input
                  type="number"
                  value={participant.weight}
                  onChange={(e) => onUpdateWeight(index, Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-16 bg-base-gray-700 border border-base-gray-600 rounded-lg px-2 py-1 text-center text-sm"
                />

                <button
                  onClick={() => onRemoveParticipant(index)}
                  className="text-base-gray-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
