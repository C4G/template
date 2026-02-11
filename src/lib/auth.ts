import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { User } from '@prisma/client';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { cookies } from 'next/headers';

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  trustHost: true,
  callbacks: {
    async session({ session, user }) {
      // Check for impersonation cookie
      const cookieStore = await cookies();
      const impersonatedUserCookie = cookieStore.get('impersonated-user');

      // Type assertion for our custom User fields
      const dbUser = user as unknown as User;

      if (impersonatedUserCookie) {
        try {
          const impersonationData = JSON.parse(impersonatedUserCookie.value);

          // Destructure impersonation data with fallbacks for backward compatibility
          const {
            impersonatedUser: newFormatUser,
            originalAdminId: newFormatAdminId,
          } = impersonationData;
          const impersonatedUser = newFormatUser ?? impersonationData;
          const originalAdminId = newFormatAdminId ?? dbUser.id;

          // Verify the original admin is still an admin and matches the current user
          const isValidImpersonation =
            originalAdminId === dbUser.id && dbUser.role === 'ADMIN';

          if (isValidImpersonation) {
            // Override session with impersonated user data
            session.user = {
              ...session.user,
              id: impersonatedUser.id,
              name: impersonatedUser.name,
              email: impersonatedUser.email,
              role: impersonatedUser.role,
              image: impersonatedUser.image || null,
            };
          } else {
            // Invalid impersonation, use original user data
            Object.assign(session.user, {
              role: dbUser.role,
              id: dbUser.id,
            });
          }
        } catch {
          // Invalid cookie, use original user data
          Object.assign(session.user, {
            role: dbUser.role,
            id: dbUser.id,
          });
        }
      } else {
        // No impersonation cookie, use original user data
        Object.assign(session.user, {
          role: dbUser.role,
          id: dbUser.id,
        });
      }

      return session;
    },
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
