'use client';

import { toast } from '@/hooks/use-toast';
import { User } from '@prisma/client';
import { authClient, useSession } from '@/lib/auth-client';
import { createContext, useContext } from 'react';

type ImpersonatedUser = Pick<User, 'id' | 'name' | 'email' | 'role' | 'image'>;

interface ImpersonationContextType {
  impersonatedUser: ImpersonatedUser | null;
  isImpersonating: boolean;
  startImpersonation: (_user: User) => Promise<void>;
  stopImpersonation: () => Promise<void>;
}

const ImpersonationContext = createContext<
  ImpersonationContextType | undefined
>(undefined);

export function ImpersonationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, refetch } = useSession();

  const isImpersonating = !!session?.session?.impersonatedBy;
  const impersonatedUser = isImpersonating
    ? (session.user as ImpersonatedUser)
    : null;

  const startImpersonation = async (user: User) => {
    try {
      const { error } = await authClient.admin.impersonateUser({
        userId: user.id,
      });
      if (error) throw new Error(error.message);

      await refetch();
    } catch (error) {
      console.error('Error starting impersonation:', error);
      throw error;
    }
  };

  const stopImpersonation = async () => {
    try {
      const { error } = await authClient.admin.stopImpersonating();
      if (error) throw new Error(error.message);

      await refetch();

      toast({
        title: 'Impersonation Stopped',
        description: 'You are no longer impersonating a user.',
      });
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop impersonation. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <ImpersonationContext.Provider
      value={{
        impersonatedUser,
        isImpersonating,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error(
      'useImpersonation must be used within an ImpersonationProvider'
    );
  }
  return context;
}
