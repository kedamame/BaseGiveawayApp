import { NextRequest, NextResponse } from 'next/server';
import { resolveAddress } from '@/lib/resolver';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const result = await resolveAddress(input);

    if (!result.address) {
      return NextResponse.json({ error: 'Could not resolve address' }, { status: 404 });
    }

    return NextResponse.json({
      address: result.address,
      inputType: result.inputType,
    });
  } catch (error) {
    console.error('Error resolving address:', error);
    return NextResponse.json({ error: 'Failed to resolve address' }, { status: 500 });
  }
}
