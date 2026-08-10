'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authClient } from '@/lib/auth-client';
import { describeAuthError } from '@/lib/auth-errors';
import { KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PasskeySettingsProps {
  isOpen: boolean;
  onOpenChange: (_open: boolean) => void;
}

const isSupported = () =>
  typeof window !== 'undefined' &&
  typeof window.PublicKeyCredential !== 'undefined';

export function PasskeySettings({
  isOpen,
  onOpenChange,
}: PasskeySettingsProps) {
  const { toast } = useToast();
  const { data: passkeys, isPending } = authClient.useListPasskeys();
  const [name, setName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddPasskey = async () => {
    setIsAdding(true);

    const result = await authClient.passkey.addPasskey({
      name: name.trim() || undefined,
    });

    setIsAdding(false);

    if (result?.error) {
      toast({
        title: 'Could not add passkey',
        description: describeAuthError(result.error),
        variant: 'destructive',
      });
      return;
    }

    setName('');
    toast({
      title: 'Passkey added',
      description: 'You can now sign in with this passkey.',
    });
  };

  const handleDeletePasskey = async (id: string) => {
    setDeletingId(id);

    const { error } = await authClient.passkey.deletePasskey({ id });

    setDeletingId(null);

    if (error) {
      toast({
        title: 'Could not remove passkey',
        description: describeAuthError(error),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Passkey removed',
      description: 'That passkey can no longer be used to sign in.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Passkeys</DialogTitle>
        </DialogHeader>

        {!isSupported() ? (
          <div className='flex flex-col items-center gap-3 p-4 text-center'>
            <KeyRound className='text-muted-foreground h-8 w-8' />
            <div>
              <h4 className='font-medium'>Passkeys Not Supported</h4>
              <p className='text-muted-foreground text-sm'>
                Your browser does not support passkeys.
              </p>
            </div>
          </div>
        ) : (
          <div className='flex flex-col gap-4 p-4'>
            <p className='text-muted-foreground text-sm'>
              Sign in with your fingerprint, face, or device PIN instead of a
              password.
            </p>

            <div className='flex flex-col gap-2'>
              {isPending ? (
                <p className='text-muted-foreground text-sm'>
                  Loading passkeys...
                </p>
              ) : passkeys && passkeys.length > 0 ? (
                <ul className='divide-y rounded-md border'>
                  {passkeys.map((passkey) => (
                    <li
                      key={passkey.id}
                      className='flex items-center justify-between gap-2 px-3 py-2'
                    >
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium'>
                          {passkey.name || 'Unnamed passkey'}
                        </p>
                        {passkey.createdAt && (
                          <p className='text-muted-foreground text-xs'>
                            Added{' '}
                            {new Date(passkey.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label={`Remove ${passkey.name || 'passkey'}`}
                        disabled={deletingId === passkey.id}
                        onClick={() => handleDeletePasskey(passkey.id)}
                      >
                        <Trash2 className='text-destructive h-4 w-4' />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  You have not added any passkeys yet.
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='passkey-name'>Name (optional)</Label>
              <Input
                id='passkey-name'
                placeholder='Work laptop'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAddPasskey}
              disabled={isAdding}
              className='w-full'
            >
              {isAdding ? (
                'Waiting for your device...'
              ) : (
                <>
                  <KeyRound className='mr-2 h-4 w-4' />
                  Add a passkey
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
