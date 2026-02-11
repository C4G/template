'use client';

import { toast } from '@/hooks/use-toast';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';

interface ImpersonationContextType {
  impersonatedUser: User | null;
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
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const { data: session, update } = useSession();

  // Check for impersonation status on mount only if user is authenticated
  useEffect(() => {
    if (session?.user) {
      checkImpersonationStatus();
    }
  }, [session?.user]);

  const checkImpersonationStatus = async () => {
    try {
      const response = await fetch('/api/impersonate/status');
      if (response.ok) {
        const data = await response.json();
        setImpersonatedUser(data.impersonatedUser || null);
      }
    } catch (error) {
      console.error('Error checking impersonation status:', error);
    }
  };

  const startImpersonation = async (user: User) => {
    try {
      const response = await fetch('/api/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setImpersonatedUser(data.impersonatedUser);

        // Force session refresh to update the UI
        await update();
      } else {
        throw new Error('Failed to start impersonation');
      }
    } catch (error) {
      console.error('Error starting impersonation:', error);
      throw error;
    }
  };

  const stopImpersonation = async () => {
    try {
      const response = await fetch('/api/impersonate', {
        method: 'DELETE',
      });

      if (response.ok) {
        setImpersonatedUser(null);

        // Force session refresh to update the UI
        await update();

        toast({
          title: 'Impersonation Stopped',
          description: 'You are no longer impersonating a user.',
        });
      } else {
        throw new Error('Failed to stop impersonation');
      }
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
        isImpersonating: !!impersonatedUser,
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
