import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://your-app.vercel.app';

  const manifest = {
    accountAssociation: {
      header: process.env.NEXT_PUBLIC_FARCASTER_HEADER || '',
      payload: process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD || '',
      signature: process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE || '',
    },
    frame: {
      version: '1',
      name: 'Giveaway App',
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/og-image.png`,
      buttonTitle: 'Open Giveaway',
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#0A0B0D',
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return NextResponse.json(manifest);
}
