import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@prisma/client';
import { FormEvent, useState } from 'react';

export interface BanUserDetails {
  banReason: string;
  banExpiresAt?: string;
}

interface BanUserDialogProps {
  isOpen: boolean;
  onOpenChange: (_: boolean) => void;
  userToBan: Pick<User, 'name'> | null;
  onConfirm: (_details: BanUserDetails) => Promise<void>;
  isLoading: boolean;
}

export function BanUserDialog({
  isOpen,
  onOpenChange,
  userToBan,
  onConfirm,
  isLoading,
}: BanUserDialogProps) {
  const [banReason, setBanReason] = useState('');
  const [banExpiresAt, setBanExpiresAt] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const reason = banReason.trim();
    if (!reason) {
      setValidationError('A reason is required.');
      return;
    }

    if (banExpiresAt && new Date(banExpiresAt).getTime() <= Date.now()) {
      setValidationError('The ban end time must be in the future.');
      return;
    }

    setValidationError(null);
    await onConfirm({
      banReason: reason,
      banExpiresAt: banExpiresAt || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban {userToBan?.name ?? 'this user'} from signing in. Leave the end
            time blank for a permanent ban.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='ban-reason'>Reason</Label>
            <Textarea
              id='ban-reason'
              value={banReason}
              onChange={(event) => setBanReason(event.target.value)}
              placeholder='Explain why this user is being banned'
              disabled={isLoading}
              aria-required='true'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='ban-expires-at'>Ban ends</Label>
            <Input
              id='ban-expires-at'
              type='datetime-local'
              value={banExpiresAt}
              onChange={(event) => setBanExpiresAt(event.target.value)}
              disabled={isLoading}
            />
            <p className='text-muted-foreground text-xs'>
              Leave blank for a permanent ban.
            </p>
          </div>
          {validationError && (
            <p className='text-destructive text-sm' role='alert'>
              {validationError}
            </p>
          )}
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' variant='destructive' disabled={isLoading}>
              {isLoading ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
