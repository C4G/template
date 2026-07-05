import type { auth } from '@/lib/auth';
import { customSessionClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  plugins: [customSessionClient<typeof auth>()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
