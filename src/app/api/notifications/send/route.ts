import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureWebPushConfigured, webpush } from '@/lib/web-push';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    ensureWebPushConfigured();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, targetUserId } = await request.json();

    let targetUsers;

    if (targetUserId) {
      // Send to specific user
      targetUsers = await prisma.user.findMany({
        where: {
          id: targetUserId,
          pushSubscription: { not: null },
        },
      });
    } else {
      // Send to all subscribed users
      targetUsers = await prisma.user.findMany({
        where: {
          pushSubscription: { not: null },
        },
      });
    }

    const notificationPayload = JSON.stringify({
      title: title || 'C4G Template Notification',
      body: body || 'You have a new notification!',
      data: {
        url: '/dashboard',
        timestamp: Date.now(),
      },
    });

    const sendPromises = targetUsers.map(async (user) => {
      try {
        const subscription = JSON.parse(user.pushSubscription!);
        await webpush.sendNotification(subscription, notificationPayload);
        return { success: true, userId: user.id };
      } catch (error) {
        console.error(`Failed to send notification to user ${user.id}:`, error);
        // If the subscription is invalid, remove it from the database
        if (
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          error.statusCode === 410
        ) {
          await prisma.user.update({
            where: { id: user.id },
            data: { pushSubscription: null },
          });
        }
        return {
          success: false,
          userId: user.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      sentTo: successCount,
      failed: failCount,
      results,
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
