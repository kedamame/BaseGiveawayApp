'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import type { Giveaway } from '@/types';

export default function GiveawayHistory() {
  const { address, isConnected } = useAccount();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchGiveaways();
    } else {
      setLoading(false);
    }
  }, [address]);

  const fetchGiveaways = async () => {
    try {
      const res = await fetch(`/api/giveaway?address=${address}`);
      const data = await res.json();
      setGiveaways(data.giveaways || []);
    } catch (error) {
      console.error('Error fetching giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

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
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-base-gray-800 bg-base-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-base-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold">Giveaway History</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!isConnected ? (
          <div className="card text-center">
            <p className="text-base-gray-400 mb-4">Connect your wallet to see your giveaway history.</p>
            <Link href="/" className="btn-primary">
              Go Home
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <svg className="w-8 h-8 animate-spin mx-auto text-base-blue" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-base-gray-400 mt-4">Loading...</p>
          </div>
        ) : giveaways.length === 0 ? (
          <div className="card text-center">
            <svg className="w-16 h-16 mx-auto text-base-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h2 className="text-xl font-bold mb-2">No Giveaways Yet</h2>
            <p className="text-base-gray-400 mb-4">Create your first giveaway to get started.</p>
            <Link href="/giveaway/create" className="btn-primary">
              Create Giveaway
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {giveaways.map((giveaway) => (
              <Link
                key={giveaway.id}
                href={`/giveaway/${giveaway.id}`}
                className="card block hover:border-base-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(giveaway.status)}`}>
                        {giveaway.status}
                      </span>
                      <span className="text-xs text-base-gray-500">
                        {giveaway.asset_type.toUpperCase()}
                      </span>
                    </div>

                    <p className="font-medium truncate">
                      {giveaway.asset_type === 'token'
                        ? `${giveaway.amount || '0'} tokens`
                        : `NFT #${giveaway.token_id || 'N/A'}`}
                    </p>

                    <p className="text-sm text-base-gray-400 truncate">
                      {giveaway.contract_address.slice(0, 10)}...{giveaway.contract_address.slice(-8)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-base-gray-400">
                      {formatDate(giveaway.created_at)}
                    </p>
                    <p className="text-xs text-base-gray-500">
                      {giveaway.winner_count} winner{giveaway.winner_count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
