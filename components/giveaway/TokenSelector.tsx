'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import type { Token, NFT } from '@/types';

interface TokenSelectorProps {
  assetType: 'token' | 'nft';
  onAssetTypeChange: (type: 'token' | 'nft') => void;
  selectedToken?: Token;
  selectedNfts: NFT[];
  onSelectToken: (token: Token) => void;
  onSelectNfts: (nfts: NFT[]) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  winnerCount: number;
  showAssetSelector?: boolean;
  hideToggle?: boolean;
}

export function TokenSelector({
  assetType,
  onAssetTypeChange,
  selectedToken,
  selectedNfts,
  onSelectToken,
  onSelectNfts,
  amount,
  onAmountChange,
  winnerCount,
  showAssetSelector = true,
  hideToggle = false,
}: TokenSelectorProps) {
  const { address } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (address) {
      fetchAssets();
    }
  }, [address, assetType]);

  const fetchAssets = async () => {
    if (!address) return;
    setLoading(true);

    try {
      if (assetType === 'token') {
        const res = await fetch(`/api/tokens?address=${address}`);
        const data = await res.json();
        setTokens(data.tokens || []);
      } else {
        const res = await fetch(`/api/nfts?address=${address}`);
        const data = await res.json();
        setNfts(data.nfts || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: string, decimals: number) => {
    const formatted = formatUnits(BigInt(balance), decimals);
    const num = parseFloat(formatted);
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  // Filter tokens by search query (name, symbol, or contract address)
  const filteredTokens = tokens.filter((token) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query) ||
      token.contractAddress.toLowerCase().includes(query)
    );
  });

  // Filter NFTs by search query (name or contract address)
  const filteredNfts = nfts.filter((nft) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      nft.name.toLowerCase().includes(query) ||
      nft.contractAddress.toLowerCase().includes(query) ||
      nft.tokenId.includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* Asset Type Toggle */}
      {!hideToggle && (
        <div className="flex gap-2">
          <button
            onClick={() => onAssetTypeChange('token')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              assetType === 'token'
                ? 'bg-base-blue text-white'
                : 'bg-base-gray-800 text-base-gray-400 hover:bg-base-gray-700'
            }`}
          >
            Token
          </button>
          <button
            onClick={() => onAssetTypeChange('nft')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              assetType === 'nft'
                ? 'bg-base-blue text-white'
                : 'bg-base-gray-800 text-base-gray-400 hover:bg-base-gray-700'
            }`}
          >
            NFT
          </button>
        </div>
      )}

      {/* Selected Asset Display / Selector - Only show for Token, or NFT when showAssetSelector is true */}
      {(assetType === 'token' || showAssetSelector) && (
      <div className="relative">
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="w-full bg-base-gray-800 border border-base-gray-600 rounded-xl p-4 text-left hover:border-base-gray-500 transition-colors"
        >
          {assetType === 'token' && selectedToken ? (
            <div className="flex items-center gap-3">
              {selectedToken.logo ? (
                <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-base-blue/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-base-blue">
                    {selectedToken.symbol.slice(0, 2)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium">{selectedToken.name}</p>
                <p className="text-sm text-base-gray-400">
                  Balance: {formatBalance(selectedToken.balance, selectedToken.decimals)} {selectedToken.symbol}
                </p>
              </div>
            </div>
          ) : assetType === 'nft' && selectedNfts.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {selectedNfts.slice(0, 3).map((nft, i) => (
                  nft.image ? (
                    <img key={`${nft.contractAddress}-${nft.tokenId}`} src={nft.image} alt={nft.name} className="w-10 h-10 rounded-lg object-cover border-2 border-base-gray-800" style={{ zIndex: 3 - i }} />
                  ) : (
                    <div key={`${nft.contractAddress}-${nft.tokenId}`} className="w-10 h-10 bg-base-blue/20 rounded-lg flex items-center justify-center border-2 border-base-gray-800" style={{ zIndex: 3 - i }}>
                      <span className="text-sm font-bold text-base-blue">NFT</span>
                    </div>
                  )
                ))}
                {selectedNfts.length > 3 && (
                  <div className="w-10 h-10 bg-base-gray-700 rounded-lg flex items-center justify-center border-2 border-base-gray-800 text-xs font-bold">
                    +{selectedNfts.length - 3}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{selectedNfts.length} NFT{selectedNfts.length > 1 ? 's' : ''} selected</p>
                <p className="text-sm text-base-gray-400">
                  {winnerCount > 1 ? `${winnerCount} winners will each receive 1 NFT` : selectedNfts[0]?.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-base-gray-400">
              <div className="w-10 h-10 bg-base-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span>Select {assetType === 'token' ? 'a token' : 'an NFT'}</span>
            </div>
          )}
        </button>

        {/* Dropdown Selector */}
        {showSelector && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setShowSelector(false); setSearchQuery(''); }} />
            <div className="absolute left-0 right-0 mt-2 bg-base-gray-800 border border-base-gray-700 rounded-xl shadow-lg z-50 max-h-80 overflow-hidden flex flex-col">
              {/* Search Input */}
              <div className="p-3 border-b border-base-gray-700">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search by name or contract address...`}
                    className="w-full bg-base-gray-700 border border-base-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-base-blue"
                    autoFocus
                  />
                </div>
              </div>

              <div className="overflow-auto flex-1">
              {loading ? (
                <div className="p-4 text-center text-base-gray-400">
                  <svg className="w-6 h-6 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </div>
              ) : assetType === 'token' ? (
                filteredTokens.length === 0 ? (
                  <div className="p-4 text-center text-base-gray-400">
                    {tokens.length === 0 ? 'No tokens found' : 'No matching tokens'}
                  </div>
                ) : (
                  filteredTokens.map((token) => (
                    <button
                      key={token.contractAddress}
                      onClick={() => {
                        onSelectToken(token);
                        setShowSelector(false);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 hover:bg-base-gray-700 transition-colors flex items-center gap-3"
                    >
                      {token.logo ? (
                        <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-base-blue/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-base-blue">{token.symbol.slice(0, 2)}</span>
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-medium">{token.name}</p>
                        <p className="text-xs text-base-gray-400">
                          {formatBalance(token.balance, token.decimals)} {token.symbol}
                        </p>
                      </div>
                    </button>
                  ))
                )
              ) : filteredNfts.length === 0 ? (
                <div className="p-4 text-center text-base-gray-400">
                  {nfts.length === 0 ? 'No NFTs found' : 'No matching NFTs'}
                </div>
              ) : (
                <>
                  {winnerCount > 1 && (
                    <div className="p-3 bg-base-blue/10 border-b border-base-gray-700 text-sm text-base-gray-300">
                      Select {winnerCount} NFTs for {winnerCount} winners
                      <span className="text-base-gray-400 ml-2">({selectedNfts.length}/{winnerCount} selected)</span>
                    </div>
                  )}
                  {filteredNfts.map((nft) => {
                    const isSelected = selectedNfts.some(
                      (n) => n.contractAddress === nft.contractAddress && n.tokenId === nft.tokenId
                    );
                    const canSelectMore = selectedNfts.length < winnerCount;
                    return (
                      <button
                        key={`${nft.contractAddress}-${nft.tokenId}`}
                        onClick={() => {
                          if (winnerCount === 1) {
                            onSelectNfts([nft]);
                            setShowSelector(false);
                            setSearchQuery('');
                          } else {
                            if (isSelected) {
                              onSelectNfts(selectedNfts.filter(
                                (n) => !(n.contractAddress === nft.contractAddress && n.tokenId === nft.tokenId)
                              ));
                            } else if (canSelectMore) {
                              onSelectNfts([...selectedNfts, nft]);
                            }
                            if (selectedNfts.length === winnerCount - 1 && !isSelected) {
                              setShowSelector(false);
                              setSearchQuery('');
                            }
                          }
                        }}
                        disabled={!isSelected && !canSelectMore}
                        className={`w-full p-3 transition-colors flex items-center gap-3 ${
                          isSelected
                            ? 'bg-base-blue/20 hover:bg-base-blue/30'
                            : canSelectMore
                            ? 'hover:bg-base-gray-700'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {winnerCount > 1 && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-base-blue border-base-blue' : 'border-base-gray-500'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                        {nft.image ? (
                          <img src={nft.image} alt={nft.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-base-blue/20 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-base-blue">NFT</span>
                          </div>
                        )}
                        <div className="text-left">
                          <p className="font-medium">{nft.name}</p>
                          <p className="text-xs text-base-gray-400">ID: {nft.tokenId}</p>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
              </div>
            </div>
          </>
        )}
      </div>
      )}

      {/* Amount Input (for tokens only) */}
      {assetType === 'token' && selectedToken && (
        <div>
          <label className="label">Total amount to distribute</label>
          <p className="text-xs text-base-gray-400 mb-2">
            This total will be split equally among {winnerCount} winner{winnerCount > 1 ? 's' : ''}
            {amount && parseFloat(amount) > 0 && winnerCount > 0 && (
              <span className="text-base-blue ml-1">
                ({(parseFloat(amount) / winnerCount).toFixed(6).replace(/\.?0+$/, '')} {selectedToken.symbol} each)
              </span>
            )}
          </p>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.0"
              className="input pr-20"
            />
            <button
              onClick={() => onAmountChange(formatUnits(BigInt(selectedToken.balance), selectedToken.decimals))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-blue text-sm font-medium hover:underline"
            >
              MAX
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
