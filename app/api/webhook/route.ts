import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle Farcaster webhook events
    const { event, data } = body;

    console.log('Webhook event:', event, data);

    switch (event) {
      case 'frame_added':
        // User added the frame to their profile
        console.log('Frame added by user:', data);
        break;

      case 'frame_removed':
        // User removed the frame from their profile
        console.log('Frame removed by user:', data);
        break;

      case 'notifications_enabled':
        // User enabled notifications
        console.log('Notifications enabled by user:', data);
        break;

      case 'notifications_disabled':
        // User disabled notifications
        console.log('Notifications disabled by user:', data);
        break;

      default:
        console.log('Unknown webhook event:', event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
