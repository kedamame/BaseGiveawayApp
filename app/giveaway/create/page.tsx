'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSendTransaction, useSwitchChain, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseUnits, parseEther } from 'viem';
import { NATIVE_ETH_ADDRESS } from '@/lib/alchemy';
import { TokenSelector } from '@/components/giveaway/TokenSelector';
import { ParticipantInput } from '@/components/giveaway/ParticipantInput';
import { CsvUpload } from '@/components/giveaway/CsvUpload';
import { CastCollector } from '@/components/giveaway/CastCollector';
import { DrawAnimation } from '@/components/giveaway/DrawAnimation';
import { ResultDisplay } from '@/components/giveaway/ResultDisplay';
import type { Token, NFT, ParticipantInput as ParticipantInputType, Participant } from '@/types';

type Step = 'setup' | 'participants' | 'draw' | 'result';
type ParticipantTab = 'manual' | 'csv' | 'farcaster';

export default function CreateGiveaway() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContract, data: txHash } = useWriteContract();
  const sendTransaction = useSendTransaction();
  const pendingHash = txHash || sendTransaction.data;
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: pendingHash,
  });

  // Target chain for transactions (Base mainnet)
  const targetChainId = base.id;

  // Track confirmed transaction hash for success screen
  const [confirmedTxHash, setConfirmedTxHash] = useState<string>();

  // Track if component has mounted (for hydration)
  const [mounted, setMounted] = useState(false);

  // Set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update confirmedTxHash when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && pendingHash) {
      setConfirmedTxHash(pendingHash);
    }
  }, [isConfirmed, pendingHash]);

  // Form state
  const [step, setStep] = useState<Step>('setup');
  const [assetType, setAssetType] = useState<'token' | 'nft'>('token');
  const [selectedToken, setSelectedToken] = useState<Token>();
  const [selectedNfts, setSelectedNfts] = useState<NFT[]>([]);
  const [amount, setAmount] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);
  const [autoTransfer, setAutoTransfer] = useState(false);
  const [participants, setParticipants] = useState<ParticipantInputType[]>([]);
  const [participantTab, setParticipantTab] = useState<ParticipantTab>('manual');

  // Draw state
  const [isDrawing, setIsDrawing] = useState(false);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [transferring, setTransferring] = useState(false);
  const [switchingChain, setSwitchingChain] = useState(false);

  // Check if on wrong chain
  const isWrongChain = mounted && chainId !== targetChainId;

  const handleAddParticipant = (participant: ParticipantInputType) => {
    setParticipants([...participants, participant]);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleUpdateWeight = (index: number, weight: number) => {
    const updated = [...participants];
    updated[index].weight = weight;
    setParticipants(updated);
  };

  const handleImportParticipants = (imported: ParticipantInputType[]) => {
    // Deduplicate by address
    const existingAddresses = new Set(
      participants.map((p) => p.resolvedAddress?.toLowerCase())
    );

    const newParticipants = imported.filter(
      (p) => !existingAddresses.has(p.resolvedAddress?.toLowerCase())
    );

    setParticipants([...participants, ...newParticipants]);
  };

  const handleStartDraw = () => {
    setIsDrawing(true);
  };

  const handleDrawComplete = (drawnWinners: Participant[]) => {
    setWinners(drawnWinners);
    setIsDrawing(false);
    setStep('result');
  };

  const handleTransfer = async () => {
    if (!address || winners.length === 0) return;

    setTransferring(true);

    try {
      // Ensure we're on the correct chain before sending transactions
      if (chainId !== targetChainId) {
        setSwitchingChain(true);
        try {
          await switchChainAsync({ chainId: targetChainId });
        } finally {
          setSwitchingChain(false);
        }
      }

      if (assetType === 'token' && selectedToken) {
        const isNativeETH = selectedToken.contractAddress.toLowerCase() === NATIVE_ETH_ADDRESS.toLowerCase();

        if (isNativeETH) {
          // Send native ETH
          const totalAmount = parseEther(amount);
          const perWinner = totalAmount / BigInt(winners.length);

          for (const winner of winners) {
            sendTransaction.mutate({
              to: winner.address as `0x${string}`,
              value: perWinner,
            });
          }
        } else {
          // Send ERC20 token
          const totalAmount = parseUnits(amount, selectedToken.decimals);
          const perWinner = totalAmount / BigInt(winners.length);

          for (const winner of winners) {
            writeContract({
              address: selectedToken.contractAddress as `0x${string}`,
              abi: [
                {
                  name: 'transfer',
                  type: 'function',
                  inputs: [
                    { name: 'to', type: 'address' },
                    { name: 'amount', type: 'uint256' },
                  ],
                  outputs: [{ name: '', type: 'bool' }],
                },
              ],
              functionName: 'transfer',
              args: [winner.address as `0x${string}`, perWinner],
            });
          }
        }
      } else if (assetType === 'nft' && selectedNfts.length > 0 && winners.length > 0) {
        // Transfer each NFT to corresponding winner
        for (let i = 0; i < Math.min(winners.length, selectedNfts.length); i++) {
          const winner = winners[i];
          const nft = selectedNfts[i];
          const isERC721 = nft.tokenType === 'ERC721';

          if (isERC721) {
            writeContract({
              address: nft.contractAddress as `0x${string}`,
              abi: [
                {
                  name: 'safeTransferFrom',
                  type: 'function',
                  inputs: [
                    { name: 'from', type: 'address' },
                    { name: 'to', type: 'address' },
                    { name: 'tokenId', type: 'uint256' },
                  ],
                  outputs: [],
                },
              ],
              functionName: 'safeTransferFrom',
              args: [
                address as `0x${string}`,
                winner.address as `0x${string}`,
                BigInt(nft.tokenId),
              ],
            });
          } else {
            writeContract({
              address: nft.contractAddress as `0x${string}`,
              abi: [
                {
                  name: 'safeTransferFrom',
                  type: 'function',
                  inputs: [
                    { name: 'from', type: 'address' },
                    { name: 'to', type: 'address' },
                    { name: 'id', type: 'uint256' },
                    { name: 'amount', type: 'uint256' },
                    { name: 'data', type: 'bytes' },
                  ],
                  outputs: [],
                },
              ],
              functionName: 'safeTransferFrom',
              args: [
                address as `0x${string}`,
                winner.address as `0x${string}`,
                BigInt(nft.tokenId),
                BigInt(1),
                '0x' as `0x${string}`,
              ],
            });
          }
        }
      }
    } catch (error) {
      console.error('Transfer error:', error);
    } finally {
      setTransferring(false);
    }
  };

  const canProceedToParticipants =
    (assetType === 'token' && selectedToken && parseFloat(amount) > 0) ||
    (assetType === 'nft' && selectedNfts.length === winnerCount);

  const canStartDraw = participants.length >= winnerCount;

  // Convert participants to format expected by DrawAnimation
  const participantsForDraw: Participant[] = participants.map((p, i) => ({
    id: `temp-${i}`,
    giveaway_id: '',
    address: p.resolvedAddress || '',
    input_type: p.inputType,
    original_input: p.input,
    weight: p.weight,
    is_winner: false,
    created_at: new Date().toISOString(),
  }));

  // Show loading state during hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-8 h-8 border-4 border-base-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Connect Wallet</h2>
          <p className="text-base-gray-400 mb-4">
            Please connect your wallet to create a giveaway.
          </p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-base-gray-800 bg-base-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-base-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold">Create Giveaway</h1>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {['setup', 'participants', 'draw', 'result'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-base-blue text-white'
                    : ['setup', 'participants', 'draw', 'result'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-base-gray-700 text-base-gray-400'
                }`}
              >
                {['setup', 'participants', 'draw', 'result'].indexOf(step) > i ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 rounded ${
                    ['setup', 'participants', 'draw', 'result'].indexOf(step) > i
                      ? 'bg-green-500'
                      : 'bg-base-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 'setup' && (
          <div className="card space-y-6">
            <h2 className="text-xl font-bold">Select Prize</h2>

            {/* Token: Toggle + Selector + Amount, NFT: Toggle only */}
            <TokenSelector
              assetType={assetType}
              onAssetTypeChange={(type) => {
                setAssetType(type);
                // Reset selections when switching type
                if (type === 'token') {
                  setSelectedNfts([]);
                } else {
                  setSelectedToken(undefined);
                  setAmount('');
                }
              }}
              selectedToken={selectedToken}
              selectedNfts={selectedNfts}
              onSelectToken={setSelectedToken}
              onSelectNfts={setSelectedNfts}
              amount={amount}
              onAmountChange={setAmount}
              winnerCount={winnerCount}
              showAssetSelector={assetType === 'token'}
            />

            {/* For NFT: Winner count first */}
            {assetType === 'nft' && (
              <div>
                <label className="label">Number of Winners</label>
                <input
                  type="number"
                  value={winnerCount}
                  onChange={(e) => {
                    const newCount = Math.max(1, parseInt(e.target.value) || 1);
                    setWinnerCount(newCount);
                    // Reset NFT selection if winner count changes
                    if (newCount !== winnerCount) {
                      setSelectedNfts([]);
                    }
                  }}
                  min="1"
                  className="input"
                />
              </div>
            )}

            {/* For NFT: NFT Selector after winner count */}
            {assetType === 'nft' && (
              <TokenSelector
                assetType={assetType}
                onAssetTypeChange={() => {}}
                selectedToken={undefined}
                selectedNfts={selectedNfts}
                onSelectToken={() => {}}
                onSelectNfts={setSelectedNfts}
                amount=""
                onAmountChange={() => {}}
                winnerCount={winnerCount}
                showAssetSelector={true}
                hideToggle={true}
              />
            )}

            {/* For Token: Winner count after amount */}
            {assetType === 'token' && (
              <div>
                <label className="label">Number of Winners</label>
                <input
                  type="number"
                  value={winnerCount}
                  onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="input"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoTransfer"
                checked={autoTransfer}
                onChange={(e) => setAutoTransfer(e.target.checked)}
                className="w-5 h-5 rounded border-base-gray-600 bg-base-gray-800 text-base-blue focus:ring-base-blue"
              />
              <label htmlFor="autoTransfer" className="text-sm">
                Automatically transfer prizes after draw
              </label>
            </div>

            <button
              onClick={() => setStep('participants')}
              disabled={!canProceedToParticipants}
              className="btn-primary w-full"
            >
              Next: Add Participants
            </button>
          </div>
        )}

        {step === 'participants' && (
          <div className="card space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Participants</h2>
              <button
                onClick={() => setStep('setup')}
                className="text-base-gray-400 hover:text-white text-sm"
              >
                Back
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-base-gray-700">
              {[
                { key: 'manual', label: 'Manual' },
                { key: 'csv', label: 'CSV' },
                { key: 'farcaster', label: 'Farcaster' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setParticipantTab(tab.key as ParticipantTab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    participantTab === tab.key
                      ? 'border-base-blue text-white'
                      : 'border-transparent text-base-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {participantTab === 'manual' && (
              <ParticipantInput
                participants={participants}
                onAddParticipant={handleAddParticipant}
                onRemoveParticipant={handleRemoveParticipant}
                onUpdateWeight={handleUpdateWeight}
              />
            )}

            {participantTab === 'csv' && (
              <CsvUpload onImport={handleImportParticipants} />
            )}

            {participantTab === 'farcaster' && (
              <CastCollector onImport={handleImportParticipants} />
            )}

            {/* Current Participants Summary */}
            {participants.length > 0 && participantTab !== 'manual' && (
              <div className="bg-base-gray-800/50 rounded-lg p-4">
                <p className="text-sm">
                  <span className="font-medium text-white">{participants.length}</span>{' '}
                  <span className="text-base-gray-400">participants added</span>
                </p>
              </div>
            )}

            <button
              onClick={() => setStep('draw')}
              disabled={!canStartDraw}
              className="btn-primary w-full"
            >
              {canStartDraw
                ? `Next: Draw ${winnerCount} Winner${winnerCount > 1 ? 's' : ''}`
                : `Add at least ${winnerCount} participant${winnerCount > 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {step === 'draw' && (
          <div className="card space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Draw Winners</h2>
              <button
                onClick={() => setStep('participants')}
                className="text-base-gray-400 hover:text-white text-sm"
              >
                Back
              </button>
            </div>

            <DrawAnimation
              participants={participantsForDraw}
              winnerCount={winnerCount}
              onComplete={handleDrawComplete}
              isDrawing={isDrawing}
            />

            {!isDrawing && winners.length === 0 && (
              <button
                onClick={handleStartDraw}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Draw
              </button>
            )}
          </div>
        )}

        {step === 'result' && (
          <div className="card">
            {/* Chain Warning Banner */}
            {isWrongChain && !confirmedTxHash && (
              <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-yellow-500 font-medium text-sm">Wrong Network</p>
                    <p className="text-yellow-500/70 text-xs">
                      You are not connected to Base. The network will be switched automatically when you transfer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chain Switching Indicator */}
            {switchingChain && (
              <div className="mb-4 p-4 bg-base-blue/10 border border-base-blue/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-base-blue animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <div>
                    <p className="text-base-blue font-medium text-sm">Switching Network</p>
                    <p className="text-base-blue/70 text-xs">Please confirm the network switch in your wallet...</p>
                  </div>
                </div>
              </div>
            )}

            <ResultDisplay
              winners={winners}
              assetType={assetType}
              token={selectedToken}
              nfts={selectedNfts}
              amount={amount}
              autoTransfer={autoTransfer}
              onTransfer={handleTransfer}
              transferring={transferring || isConfirming || switchingChain}
              transactionHash={confirmedTxHash}
            />

            <div className="mt-6 pt-6 border-t border-base-gray-700">
              <Link href="/" className="btn-secondary w-full text-center">
                Create Another Giveaway
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
