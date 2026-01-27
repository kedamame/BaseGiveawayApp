import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Add participants to a giveaway
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const { giveawayId, participants } = body;

    if (!giveawayId || !participants || !Array.isArray(participants)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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

    const { error } = await supabase
      .from('participants')
      .insert(participantRecords);

    if (error) {
      console.error('Error adding participants:', error);
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: participantRecords.length });
  } catch (error) {
    console.error('Error in participants creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get participants for a giveaway
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const giveawayId = searchParams.get('giveawayId');

    if (!giveawayId) {
      return NextResponse.json({ error: 'Giveaway ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('giveaway_id', giveawayId);

    if (error) {
      console.error('Error fetching participants:', error);
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }

    return NextResponse.json({ participants: data });
  } catch (error) {
    console.error('Error in participants fetch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete participant
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const participantId = searchParams.get('id');

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId);

    if (error) {
      console.error('Error deleting participant:', error);
      return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in participant deletion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
