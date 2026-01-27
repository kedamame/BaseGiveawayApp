// Giveaway types
export interface Giveaway {
  id: string;
  creator_address: string;
  creator_fid?: number;
  asset_type: 'token' | 'nft';
  contract_address: string;
  token_id?: string;
  amount?: string;
  winner_count: number;
  auto_transfer: boolean;
  status: 'pending' | 'drawn' | 'completed';
  created_at: string;
}

export interface Participant {
  id: string;
  giveaway_id: string;
  address: string;
  input_type: 'address' | 'basename' | 'ens' | 'farcaster';
  original_input: string;
  weight: number;
  is_winner: boolean;
  created_at: string;
}

// Token types
export interface Token {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  logo?: string;
}

export interface NFT {
  contractAddress: string;
  tokenId: string;
  name: string;
  description?: string;
  image?: string;
  tokenType: 'ERC721' | 'ERC1155';
  balance?: number;
}

// Participant input types
export interface ParticipantInput {
  input: string;
  inputType: 'address' | 'basename' | 'ens' | 'farcaster';
  weight: number;
  resolvedAddress?: string;
}

// Cast reaction types
export interface CastReaction {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  address?: string;
}

// Giveaway creation form
export interface GiveawayFormData {
  assetType: 'token' | 'nft';
  contractAddress: string;
  tokenId?: string;
  amount?: string;
  winnerCount: number;
  autoTransfer: boolean;
  participants: ParticipantInput[];
}

// Draw result
export interface DrawResult {
  winners: Participant[];
  allParticipants: Participant[];
  drawnAt: string;
  transactionHash?: string;
}

// Farcaster user
export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  verifiedAddresses: string[];
}

// Auth state
export interface AuthState {
  isConnected: boolean;
  address?: string;
  farcasterUser?: FarcasterUser;
}
