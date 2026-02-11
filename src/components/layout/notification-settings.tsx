'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff } from 'lucide-react';

interface NotificationSettingsProps {
  isOpen: boolean;
  onOpenChange: (_open: boolean) => void;
}

export function NotificationSettings({
  isOpen,
  onOpenChange,
}: NotificationSettingsProps) {
  const { toast } = useToast();

  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const handleClose = () => onOpenChange(false);

  const handleSubscriptionToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        toast({
          title: 'Unsubscribed',
          description: 'You will no longer receive push notifications.',
        });
        // Auto-close after successful unsubscribe
        handleClose();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to unsubscribe from notifications.',
          variant: 'destructive',
        });
      }
    } else {
      const success = await subscribe();
      if (success) {
        toast({
          title: 'Subscribed',
          description: 'You will now receive push notifications.',
        });
        // Auto-close after successful subscribe
        handleClose();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to subscribe to notifications.',
          variant: 'destructive',
        });
      }
    }
  };

  if (!isSupported) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col items-center gap-3 p-4 text-center'>
            <BellOff className='h-8 w-8 text-muted-foreground' />
            <div>
              <h4 className='font-medium'>Notifications Not Supported</h4>
              <p className='text-sm text-muted-foreground'>
                Your browser does not support push notifications.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 p-4'>
          <div className='flex items-center gap-2'>
            <Bell className='h-4 w-4' />
            <h3 className='font-medium'>Push Notifications</h3>
          </div>

          <div className='flex flex-col gap-2'>
            {error && <p className='text-sm text-destructive'>{error}</p>}

            <p className='text-sm text-muted-foreground'>
              {isSubscribed
                ? 'You are subscribed to receive notifications.'
                : 'Subscribe to receive important updates and notifications.'}
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            <Button
              onClick={handleSubscriptionToggle}
              disabled={isLoading}
              variant={isSubscribed ? 'destructive' : 'default'}
              className='w-full'
            >
              {isLoading ? (
                'Processing...'
              ) : isSubscribed ? (
                <>
                  <BellOff className='mr-2 h-4 w-4' />
                  Unsubscribe
                </>
              ) : (
                <>
                  <Bell className='mr-2 h-4 w-4' />
                  Subscribe
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
