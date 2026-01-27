import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Get giveaway by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

    const { data: giveaway, error: giveawayError } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', id)
      .single();

    if (giveawayError || !giveaway) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .eq('giveaway_id', id);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
    }

    return NextResponse.json({
      giveaway,
      participants: participants || [],
    });
  } catch (error) {
    console.error('Error fetching giveaway:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update giveaway (draw winners, update status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();

    const { winners, status, transactionHash } = body;

    // Update giveaway status
    if (status) {
      const { error } = await supabase
        .from('giveaways')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating giveaway status:', error);
        return NextResponse.json({ error: 'Failed to update giveaway' }, { status: 500 });
      }
    }

    // Mark winners
    if (winners && Array.isArray(winners)) {
      for (const winnerId of winners) {
        await supabase
          .from('participants')
          .update({ is_winner: true })
          .eq('id', winnerId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating giveaway:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete giveaway
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

    // Delete participants first
    await supabase
      .from('participants')
      .delete()
      .eq('giveaway_id', id);

    // Delete giveaway
    const { error } = await supabase
      .from('giveaways')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting giveaway:', error);
      return NextResponse.json({ error: 'Failed to delete giveaway' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting giveaway:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
