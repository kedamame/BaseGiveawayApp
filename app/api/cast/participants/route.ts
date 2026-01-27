import { NextRequest, NextResponse } from 'next/server';
import { getParticipantsFromCast } from '@/lib/neynar';

export async function POST(request: NextRequest) {
  try {
    const { castUrl } = await request.json();

    if (!castUrl) {
      return NextResponse.json({ error: 'Cast URL is required' }, { status: 400 });
    }

    const participants = await getParticipantsFromCast(castUrl);

    if (participants.length === 0) {
      return NextResponse.json({ error: 'No participants found for this cast' }, { status: 404 });
    }

    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Error fetching cast participants:', error);
    return NextResponse.json({ error: 'Failed to fetch cast participants' }, { status: 500 });
  }
}
