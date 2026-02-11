import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the impersonation cookie to check the original admin ID
    const cookieStore = await cookies();
    const impersonatedUserCookie = cookieStore.get('impersonated-user');

    let impersonatedUser = null;

    if (impersonatedUserCookie) {
      try {
        const impersonationData = JSON.parse(impersonatedUserCookie.value);

        // Check if the original admin is still an admin
        const originalAdmin = await prisma.user.findUnique({
          where: { id: impersonationData.originalAdminId },
          select: { role: true },
        });

        if (originalAdmin?.role !== 'ADMIN') {
          // Original admin is no longer admin, clear the cookie
          const response = NextResponse.json({ impersonatedUser: null });
          response.cookies.delete('impersonated-user');
          return response;
        }

        // Check if the impersonation data has the new format
        if (impersonationData.impersonatedUser) {
          impersonatedUser = impersonationData.impersonatedUser;
        } else {
          // Old format, treat the entire data as the impersonated user
          impersonatedUser = impersonationData;
        }
      } catch {
        // Invalid cookie format, ignore
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

    return NextResponse.json({ impersonatedUser });
  } catch (error) {
    console.error('Error checking impersonation status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
