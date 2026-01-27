'use client';

import { useState } from 'react';
import type { Participant, Token, NFT } from '@/types';

interface ResultDisplayProps {
  winners: Participant[];
  assetType: 'token' | 'nft';
  token?: Token;
  nfts: NFT[];
  amount?: string;
  autoTransfer: boolean;
  onTransfer: () => void;
  transferring: boolean;
  transactionHash?: string;
}

export function ResultDisplay({
  winners,
  assetType,
  token,
  nfts,
  amount,
  autoTransfer,
  onTransfer,
  transferring,
  transactionHash,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const perWinnerAmount = amount && winners.length > 0
    ? (parseFloat(amount) / winners.length).toFixed(6).replace(/\.?0+$/, '')
    : null;

  const handleCopy = () => {
    const text = winners.map((w) => w.address).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show success screen when transaction is complete
  if (transactionHash) {
    return (
      <div className="space-y-6">
        {/* Success Animation */}
        <div className="text-center py-8">
          <div className="relative inline-block">
            {/* Confetti effect */}
            <div className="absolute inset-0 -m-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping"
                  style={{
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'][i % 5],
                    left: `${50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                    top: `${50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s',
                  }}
                />
              ))}
            </div>

            {/* Success icon */}
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-green-500 mt-6">Transfer Complete!</h2>
          <p className="text-base-gray-400 mt-2">
            Successfully sent to {winners.length} winner{winners.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Transaction Summary */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-400">Transaction Confirmed</p>
              <p className="text-sm text-base-gray-400">Your transfer has been processed on Base</p>
            </div>
          </div>

          {assetType === 'token' && token && (
            <div className="bg-base-gray-800/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-base-gray-400">Amount Sent</span>
                <span className="text-xl font-bold text-white">{amount} {token.symbol}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-base-gray-400">Per Winner</span>
                <span className="text-base-gray-300">{perWinnerAmount} {token.symbol}</span>
              </div>
            </div>
          )}

          {assetType === 'nft' && nfts.length > 0 && (
            <div className="bg-base-gray-800/50 rounded-lg p-4 mb-4 space-y-2">
              <p className="text-sm text-base-gray-400 mb-2">{nfts.length} NFT{nfts.length > 1 ? 's' : ''} transferred</p>
              <div className="flex flex-wrap gap-2">
                {nfts.slice(0, 4).map((nft) => (
                  <div key={`${nft.contractAddress}-${nft.tokenId}`} className="flex items-center gap-2 bg-base-gray-700/50 rounded-lg p-2">
                    {nft.image && (
                      <img src={nft.image} alt={nft.name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div className="text-sm">
                      <p className="font-medium truncate max-w-[100px]">{nft.name}</p>
                      <p className="text-xs text-base-gray-400">#{nft.tokenId}</p>
                    </div>
                  </div>
                ))}
                {nfts.length > 4 && (
                  <div className="flex items-center justify-center w-10 h-10 bg-base-gray-700/50 rounded-lg text-sm text-base-gray-400">
                    +{nfts.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          <a
            href={`https://basescan.org/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-3 px-4 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Basescan
          </a>
        </div>

        {/* Winners List (Collapsed) */}
        <div className="bg-base-gray-800/50 rounded-xl p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
            </svg>
            Winners ({winners.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-auto">
            {winners.map((winner, index) => (
              <div key={winner.id} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 bg-base-gray-700 rounded-full flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span className="text-base-gray-300 truncate flex-1">{winner.original_input}</span>
                <span className="text-base-gray-500">{formatAddress(winner.address)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Winner Addresses
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Winners List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
          </svg>
          Winners ({winners.length})
        </h3>

        <div className="space-y-2">
          {winners.map((winner, index) => (
            <div
              key={winner.id}
              className="flex items-center gap-4 bg-base-gray-800 rounded-xl p-4"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{winner.original_input}</p>
                <p className="text-sm text-base-gray-400">
                  {formatAddress(winner.address)}
                </p>
              </div>

              {assetType === 'token' && perWinnerAmount && token && (
                <div className="text-right">
                  <p className="font-medium text-base-blue">
                    {perWinnerAmount} {token.symbol}
                  </p>
                </div>
              )}

              {assetType === 'nft' && nfts[index] && (
                <div className="flex items-center gap-2">
                  {nfts[index].image && (
                    <img src={nfts[index].image} alt={nfts[index].name} className="w-8 h-8 rounded object-cover" />
                  )}
                  <p className="text-sm text-base-gray-400">#{nfts[index].tokenId}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prize Summary */}
      <div className="bg-base-gray-800/50 rounded-xl p-4 border border-base-gray-700">
        <h4 className="text-sm font-medium text-base-gray-400 mb-2">Prize Summary</h4>

        {assetType === 'token' && token && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-base-gray-400">Total</span>
              <span className="font-medium">{amount} {token.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-gray-400">Per winner</span>
              <span className="font-medium">{perWinnerAmount} {token.symbol}</span>
            </div>
          </div>
        )}

        {assetType === 'nft' && nfts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-base-gray-300">{nfts.length} NFT{nfts.length > 1 ? 's' : ''} to {winners.length} winner{winners.length > 1 ? 's' : ''}</p>
            <div className="flex flex-wrap gap-2">
              {nfts.map((nft) => (
                <div key={`${nft.contractAddress}-${nft.tokenId}`} className="flex items-center gap-2 bg-base-gray-700/50 rounded-lg p-2">
                  {nft.image && (
                    <img src={nft.image} alt={nft.name} className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[100px]">{nft.name}</p>
                    <p className="text-xs text-base-gray-400">#{nft.tokenId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transfer Button */}
      <div className="flex gap-3">
        <button
          onClick={onTransfer}
          disabled={transferring}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {transferring ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send to Winners
            </>
          )}
        </button>
      </div>

      {/* Copy Winners */}
      <button
        onClick={handleCopy}
        className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Winner Addresses
          </>
        )}
      </button>
    </div>
  );
}
