-- Giveaways table
CREATE TABLE IF NOT EXISTS giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_address TEXT NOT NULL,
  creator_fid INTEGER,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('token', 'nft')),
  contract_address TEXT NOT NULL,
  token_id TEXT,
  amount TEXT,
  winner_count INTEGER DEFAULT 1,
  auto_transfer BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'drawn', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID REFERENCES giveaways(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('address', 'basename', 'ens', 'farcaster')),
  original_input TEXT NOT NULL,
  weight INTEGER DEFAULT 1,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_giveaways_creator ON giveaways(creator_address);
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON giveaways(status);
CREATE INDEX IF NOT EXISTS idx_participants_giveaway ON participants(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_participants_address ON participants(address);
CREATE INDEX IF NOT EXISTS idx_participants_winner ON participants(is_winner);

-- Enable Row Level Security (RLS)
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Policies for giveaways
CREATE POLICY "Anyone can view giveaways"
  ON giveaways FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create giveaways"
  ON giveaways FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can update their giveaways"
  ON giveaways FOR UPDATE
  USING (true);

CREATE POLICY "Creators can delete their giveaways"
  ON giveaways FOR DELETE
  USING (true);

-- Policies for participants
CREATE POLICY "Anyone can view participants"
  ON participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add participants"
  ON participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update participants"
  ON participants FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete participants"
  ON participants FOR DELETE
  USING (true);
