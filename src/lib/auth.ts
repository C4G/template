import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { customSession } from 'better-auth/plugins';
import { cookies, headers } from 'next/headers';

type UserRole = User['role'];

interface ImpersonatedUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image: string | null;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const dbUser = user as typeof user & { role: UserRole };
      const sessionUser = {
        ...user,
        role: dbUser.role ?? null,
      };

      // Check for impersonation cookie
      const cookieStore = await cookies();
      const impersonatedUserCookie = cookieStore.get('impersonated-user');

      if (impersonatedUserCookie) {
        try {
          const impersonationData = JSON.parse(impersonatedUserCookie.value);

          // Destructure impersonation data with fallbacks for backward compatibility
          const {
            impersonatedUser: newFormatUser,
            originalAdminId: newFormatAdminId,
          } = impersonationData;
          const impersonatedUser: ImpersonatedUser =
            newFormatUser ?? impersonationData;
          const originalAdminId = newFormatAdminId ?? dbUser.id;

          // Verify the original admin is still an admin and matches the current user
          const isValidImpersonation =
            originalAdminId === dbUser.id && dbUser.role === 'ADMIN';

          if (isValidImpersonation) {
            // Override session with impersonated user data
            return {
              session,
              user: {
                ...sessionUser,
                id: impersonatedUser.id,
                name: impersonatedUser.name ?? '',
                email: impersonatedUser.email,
                role: impersonatedUser.role,
                image: impersonatedUser.image || null,
              },
            };
          }
        } catch {
          // Invalid cookie, fall through to the original user data
        }
      }

      return { session, user: sessionUser };
    }),
    // nextCookies must remain the last plugin
    nextCookies(),
  ],
});

/**
 * Returns the current session (or null) for server components and route
 * handlers, including the `role` field and any active impersonation override.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;
export type SessionUser = Session['user'];
