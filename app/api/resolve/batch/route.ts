import { NextRequest, NextResponse } from 'next/server';
import { batchResolveAddresses } from '@/lib/resolver';

export async function POST(request: NextRequest) {
  try {
    const { inputs } = await request.json();

    if (!inputs || !Array.isArray(inputs)) {
      return NextResponse.json({ error: 'Inputs array is required' }, { status: 400 });
    }

    if (inputs.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 inputs allowed' }, { status: 400 });
    }

    const results = await batchResolveAddresses(inputs);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error batch resolving addresses:', error);
    return NextResponse.json({ error: 'Failed to resolve addresses' }, { status: 500 });
  }
}
