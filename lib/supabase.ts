import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if URL is available
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Server-side client with service role key
export const createServerClient = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(url, serviceKey);
};

// Database types
export interface Database {
  public: {
    Tables: {
      giveaways: {
        Row: {
          id: string;
          creator_address: string;
          creator_fid: number | null;
          asset_type: string;
          contract_address: string;
          token_id: string | null;
          amount: string | null;
          winner_count: number;
          auto_transfer: boolean;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_address: string;
          creator_fid?: number | null;
          asset_type: string;
          contract_address: string;
          token_id?: string | null;
          amount?: string | null;
          winner_count?: number;
          auto_transfer?: boolean;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_address?: string;
          creator_fid?: number | null;
          asset_type?: string;
          contract_address?: string;
          token_id?: string | null;
          amount?: string | null;
          winner_count?: number;
          auto_transfer?: boolean;
          status?: string;
          created_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          giveaway_id: string;
          address: string;
          input_type: string;
          original_input: string;
          weight: number;
          is_winner: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          giveaway_id: string;
          address: string;
          input_type: string;
          original_input: string;
          weight?: number;
          is_winner?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          giveaway_id?: string;
          address?: string;
          input_type?: string;
          original_input?: string;
          weight?: number;
          is_winner?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
