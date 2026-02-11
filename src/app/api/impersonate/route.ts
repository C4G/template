import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the current user is an admin (before impersonation)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify the user exists
    const userToImpersonate = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, image: true },
    });

    if (!userToImpersonate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Set impersonation cookie with both impersonated user and original admin ID
    const impersonationData = {
      impersonatedUser: userToImpersonate,
      originalAdminId: session.user.id,
    };

    const response = NextResponse.json({
      success: true,
      impersonatedUser: userToImpersonate,
    });

    response.cookies.set(
      'impersonated-user',
      JSON.stringify(impersonationData),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      }
    );

    return response;
  } catch (error) {
    console.error('Error starting impersonation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the impersonation cookie to check the original admin ID
    const cookieStore = await cookies();
    const impersonatedUserCookie = cookieStore.get('impersonated-user');

    if (impersonatedUserCookie) {
      try {
        const impersonationData = JSON.parse(impersonatedUserCookie.value);

        // Check if the original admin is still an admin
        const originalAdmin = await prisma.user.findUnique({
          where: { id: impersonationData.originalAdminId },
          select: { role: true },
        });

        if (originalAdmin?.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      } catch {
        // Invalid cookie format, but we'll still allow deletion
      }
    } else {
      // No impersonation cookie, check if current user is admin
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (currentUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Remove impersonation cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('impersonated-user');

    return response;
  } catch (error) {
    console.error('Error stopping impersonation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
