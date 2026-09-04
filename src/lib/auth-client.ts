import type { auth } from '@/lib/auth';
import { passkeyClient } from '@better-auth/passkey/client';
import { customSessionClient } from 'better-auth/client/plugins';
import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { adminAc, userAc } from 'better-auth/plugins/admin/access';

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      roles: {
        ADMIN: adminAc,
        STAFF: userAc,
      },
    }),
    customSessionClient<typeof auth>(),
    passkeyClient(),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
