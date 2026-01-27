import type { Participant } from '@/types';

// Weighted random selection using Fisher-Yates shuffle variant
export function weightedRandomDraw(
  participants: Participant[],
  winnerCount: number
): Participant[] {
  if (participants.length === 0) return [];
  if (winnerCount >= participants.length) return [...participants];

  // Create weighted pool
  const pool: Participant[] = [];
  for (const participant of participants) {
    // Add participant to pool based on their weight
    for (let i = 0; i < participant.weight; i++) {
      pool.push(participant);
    }
  }

  const winners: Participant[] = [];
  const selectedIds = new Set<string>();

  while (winners.length < winnerCount && pool.length > 0) {
    // Generate cryptographically secure random index
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const randomIndex = randomBytes[0] % pool.length;

    const selected = pool[randomIndex];

    // Avoid selecting the same participant twice
    if (!selectedIds.has(selected.id)) {
      selectedIds.add(selected.id);
      winners.push(selected);

      // Remove all instances of this participant from the pool
      for (let i = pool.length - 1; i >= 0; i--) {
        if (pool[i].id === selected.id) {
          pool.splice(i, 1);
        }
      }
    }
  }

  return winners;
}

// Simple random draw without weights
export function simpleRandomDraw(
  participants: Participant[],
  winnerCount: number
): Participant[] {
  if (participants.length === 0) return [];
  if (winnerCount >= participants.length) return [...participants];

  // Fisher-Yates shuffle
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const j = randomBytes[0] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, winnerCount);
}

// Calculate total weight
export function calculateTotalWeight(participants: Participant[]): number {
  return participants.reduce((sum, p) => sum + p.weight, 0);
}

// Calculate win probability for each participant
export function calculateWinProbabilities(
  participants: Participant[],
  winnerCount: number
): Map<string, number> {
  const totalWeight = calculateTotalWeight(participants);
  const probabilities = new Map<string, number>();

  for (const participant of participants) {
    // Approximate probability (not exact for multiple winners)
    const probability = Math.min(
      (participant.weight / totalWeight) * winnerCount,
      1
    );
    probabilities.set(participant.id, probability);
  }

  return probabilities;
}

// Verify draw result (for transparency)
export function generateDrawProof(
  participants: Participant[],
  winners: Participant[],
  seed: string
): string {
  const data = {
    participants: participants.map(p => ({
      id: p.id,
      address: p.address,
      weight: p.weight,
    })),
    winners: winners.map(w => ({
      id: w.id,
      address: w.address,
    })),
    seed,
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(data);
}
