'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Participant } from '@/types';

interface DrawAnimationProps {
  participants: Participant[];
  winnerCount: number;
  onComplete: (winners: Participant[]) => void;
  isDrawing: boolean;
}

export function DrawAnimation({
  participants,
  winnerCount,
  onComplete,
  isDrawing,
}: DrawAnimationProps) {
  const [currentIndices, setCurrentIndices] = useState<number[]>([]);
  const [speed, setSpeed] = useState(50);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'slowing' | 'complete'>('idle');
  const [winners, setWinners] = useState<Participant[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-generate confetti positions (only once when confetti shows)
  const confettiData = useMemo(() => {
    if (!showConfetti) return [];
    return Array.from({ length: 50 }).map((_, i) => ({
      left: Math.random() * 100,
      color: ['#0052FF', '#FFD700', '#FF69B4', '#00FF00'][i % 4],
      delay: (i % 10) * 0.05,
      rotation: (i * 37) % 360,
    }));
  }, [showConfetti]);

  // Initialize indices for each winner slot
  useEffect(() => {
    if (currentIndices.length !== winnerCount && participants.length > 0) {
      setCurrentIndices(Array.from({ length: winnerCount }, (_, i) => i % Math.max(1, participants.length)));
    }
  }, [winnerCount, participants.length, currentIndices.length]);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const performDraw = useCallback(() => {
    // Weighted random selection
    const pool: Participant[] = [];
    for (const p of participants) {
      for (let i = 0; i < p.weight; i++) {
        pool.push(p);
      }
    }

    const selected: Participant[] = [];
    const selectedIds = new Set<string>();

    while (selected.length < winnerCount && pool.length > 0) {
      const randomBytes = new Uint32Array(1);
      crypto.getRandomValues(randomBytes);
      const randomIndex = randomBytes[0] % pool.length;
      const winner = pool[randomIndex];

      if (!selectedIds.has(winner.id)) {
        selectedIds.add(winner.id);
        selected.push(winner);

        // Remove all instances of this winner from pool
        for (let i = pool.length - 1; i >= 0; i--) {
          if (pool[i].id === winner.id) {
            pool.splice(i, 1);
          }
        }
      }
    }

    return selected;
  }, [participants, winnerCount]);

  useEffect(() => {
    if (isDrawing && phase === 'idle') {
      setPhase('spinning');
      setSpeed(50);
    }
  }, [isDrawing, phase]);

  useEffect(() => {
    if (phase === 'spinning') {
      const spinDuration = 2000; // 2 seconds of fast spinning
      const timer = setTimeout(() => {
        setPhase('slowing');
      }, spinDuration);

      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'slowing') {
      const slowDuration = 1500; // 1.5 seconds of slowing down
      const startTime = Date.now();

      const slowDown = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / slowDuration;

        if (progress >= 1) {
          setPhase('complete');
          const drawnWinners = performDraw();
          setWinners(drawnWinners);
          setShowConfetti(true);
          onComplete(drawnWinners);

          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          // Exponential slowdown
          const newSpeed = 50 + Math.pow(progress, 2) * 450;
          setSpeed(newSpeed);
          requestAnimationFrame(slowDown);
        }
      };

      requestAnimationFrame(slowDown);
    }
  }, [phase, performDraw, onComplete]);

  useEffect(() => {
    if (phase === 'spinning' || phase === 'slowing') {
      const interval = setInterval(() => {
        setCurrentIndices((prev) =>
          prev.map((idx, i) => {
            // Each slot spins at slightly different speeds for visual variety
            return (idx + 1 + (i % 3)) % participants.length;
          })
        );
      }, speed);

      return () => clearInterval(interval);
    }
  }, [phase, speed, participants.length]);

  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-base-gray-400">
        Add participants to start the draw
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Confetti Effect */}
      {showConfetti && confettiData.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {confettiData.map((confetti, i) => (
            <div
              key={i}
              className="confetti absolute w-2 h-2"
              style={{
                left: `${confetti.left}%`,
                backgroundColor: confetti.color,
                animationDelay: `${confetti.delay}s`,
                transform: `rotate(${confetti.rotation}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Display */}
      <div className="text-center py-6">
        {phase === 'complete' ? (
          <div className="space-y-4">
            <div className="text-2xl font-bold text-base-blue animate-bounce-in">
              Winner{winners.length > 1 ? 's' : ''}!
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {winners.map((winner, index) => (
                <div
                  key={winner.id}
                  className="flex items-center gap-3 bg-base-blue/20 border border-base-blue/40 rounded-xl px-4 py-3 animate-bounce-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-8 h-8 bg-base-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{winner.original_input}</p>
                    <p className="text-xs text-base-gray-400">
                      {formatAddress(winner.address)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Multiple winner slots */}
            <div className={`flex flex-wrap justify-center gap-3 ${winnerCount > 3 ? 'max-h-48 overflow-y-auto' : ''}`}>
              {Array.from({ length: winnerCount }).map((_, slotIndex) => {
                const currentParticipant = participants[currentIndices[slotIndex] || 0];
                return (
                  <div
                    key={slotIndex}
                    className={`transition-all duration-100 ${
                      phase !== 'idle' ? 'animate-pulse' : ''
                    }`}
                  >
                    <div
                      className={`${
                        phase !== 'idle' ? 'animate-pulse-glow' : ''
                      } bg-base-gray-800 rounded-xl px-4 py-3 min-w-[140px] border-2 ${
                        phase !== 'idle' ? 'border-base-blue/50' : 'border-base-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-base-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-base-gray-400">
                          {slotIndex + 1}
                        </div>
                        <span className="text-xs text-base-gray-500">
                          {phase === 'idle' ? 'Winner' : 'Drawing...'}
                        </span>
                      </div>
                      <p className="text-base-blue text-sm font-bold truncate">
                        {phase === 'idle' ? '?' : currentParticipant?.original_input || '?'}
                      </p>
                      {phase !== 'idle' && currentParticipant && (
                        <p className="text-xs text-base-gray-400 mt-1 truncate">
                          {formatAddress(currentParticipant.address)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {phase !== 'idle' && (
              <p className="text-base-gray-400 animate-pulse text-sm">
                {phase === 'spinning' ? 'Drawing...' : 'Slowing down...'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 text-sm text-base-gray-400 mt-2 pt-4 border-t border-base-gray-800">
        <div>
          <span className="font-medium text-white">{participants.length}</span> participants
        </div>
        <div>
          <span className="font-medium text-white">{winnerCount}</span> winner{winnerCount > 1 ? 's' : ''}
        </div>
        <div>
          <span className="font-medium text-white">
            {participants.reduce((sum, p) => sum + p.weight, 0)}
          </span> total weight
        </div>
      </div>
    </div>
  );
}
