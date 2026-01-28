import { NextRequest, NextResponse } from 'next/server';
import { getTokenBalances } from '@/lib/alchemy';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  console.log('Token API called with address:', address);
  console.log('Alchemy API Key exists:', !!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY);

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const tokens = await getTokenBalances(address);
    console.log('Tokens fetched:', tokens.length);
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens', details: String(error) }, { status: 500 });
  }
}
