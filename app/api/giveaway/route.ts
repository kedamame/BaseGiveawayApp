import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Create a new giveaway
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const {
      creatorAddress,
      creatorFid,
      assetType,
      contractAddress,
      tokenId,
      amount,
      winnerCount,
      autoTransfer,
      participants,
    } = body;

    if (!creatorAddress || !assetType || !contractAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create giveaway
    const giveawayId = uuidv4();
    const { error: giveawayError } = await supabase
      .from('giveaways')
      .insert({
        id: giveawayId,
        creator_address: creatorAddress,
        creator_fid: creatorFid || null,
        asset_type: assetType,
        contract_address: contractAddress,
        token_id: tokenId || null,
        amount: amount || null,
        winner_count: winnerCount || 1,
        auto_transfer: autoTransfer || false,
        status: 'pending',
      });

    if (giveawayError) {
      console.error('Error creating giveaway:', giveawayError);
      return NextResponse.json({ error: 'Failed to create giveaway' }, { status: 500 });
    }

    // Add participants if provided
    if (participants && Array.isArray(participants) && participants.length > 0) {
      const participantRecords = participants.map((p: {
        address: string;
        inputType: string;
        originalInput: string;
        weight?: number;
      }) => ({
        id: uuidv4(),
        giveaway_id: giveawayId,
        address: p.address,
        input_type: p.inputType,
        original_input: p.originalInput,
        weight: p.weight || 1,
        is_winner: false,
      }));

      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participantRecords);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        // Don't fail the whole request, just log the error
      }
    }

    return NextResponse.json({ id: giveawayId });
  } catch (error) {
    console.error('Error in giveaway creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get all giveaways for an address
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('giveaways')
      .select('*')
      .eq('creator_address', address.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching giveaways:', error);
      return NextResponse.json({ error: 'Failed to fetch giveaways' }, { status: 500 });
    }

    return NextResponse.json({ giveaways: data });
  } catch (error) {
    console.error('Error in giveaway fetch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
