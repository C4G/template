import { prisma } from '@/lib/prisma';
import { passkey } from '@better-auth/passkey';
import type { User } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, customSession } from 'better-auth/plugins';
import { adminAc, userAc } from 'better-auth/plugins/admin/access';
import { headers } from 'next/headers';

type UserRole = User['role'];

/**
 * Passkeys are scoped to this exact hostname, so each app sharing a parent
 * domain (template.c4g.dev vs. another-app.c4g.dev) keeps its own credentials.
 * Pointing this at the parent domain instead would let any sibling subdomain
 * assert them. Falls back to the plugin's own baseURL derivation when unset.
 */
const passkeyRpID =
  process.env.PASSKEY_RP_ID ||
  (process.env.BETTER_AUTH_URL
    ? new URL(process.env.BETTER_AUTH_URL).hostname
    : undefined);

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
    admin({
      defaultRole: 'STAFF',
      adminRoles: ['ADMIN'],
      // Preserve the existing UI behavior, which allowed admins to
      // impersonate users regardless of their role.
      allowImpersonatingAdmins: true,
      impersonationSessionDuration: 60 * 60 * 24,
      roles: {
        ADMIN: adminAc,
        STAFF: userAc,
      },
    }),
    passkey({
      rpID: passkeyRpID,
      rpName: 'Template',
    }),
    customSession(async ({ user, session }) => {
      const dbUser = user as typeof user & { role: UserRole };
      return {
        session,
        user: {
          ...user,
          role: dbUser.role ?? null,
        },
      };
    }),
    // nextCookies must remain the last plugin
    nextCookies(),
  ],
});

/**
 * Returns the current session (or null) for server components and route
 * handlers, including the `role` and native impersonation fields.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;
export type SessionUser = Session['user'];
