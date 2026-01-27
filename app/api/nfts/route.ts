import { NextRequest, NextResponse } from 'next/server';
import { getNftsForOwner } from '@/lib/alchemy';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const nfts = await getNftsForOwner(address);
    return NextResponse.json({ nfts });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
  }
}
