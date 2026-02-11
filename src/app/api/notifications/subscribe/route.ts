import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureWebPushConfigured, publicKey } from '@/lib/web-push';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    ensureWebPushConfigured();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Store subscription in database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        pushSubscription: JSON.stringify(subscription),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove subscription from database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        pushSubscription: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from notifications' },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!publicKey) {
    return NextResponse.json(
      { error: 'Push notifications are not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    publicKey,
  });
}
