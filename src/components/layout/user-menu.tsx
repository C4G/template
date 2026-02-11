'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useImpersonation } from '@/components/contexts/impersonation-context';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { Bell, LogOut, UserCog, UserX } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { EditProfileDialog } from './edit-profile-dialog';
import { NotificationSettings } from './notification-settings';
import { ThemeSwitcher } from './theme-switcher';
import { useToast } from '@/hooks/use-toast';

export function UserMenu() {
  const { data: session } = useSession();
  const { isImpersonating, stopImpersonation } = useImpersonation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] =
    useState(false);

  const handleStopImpersonation = async () => {
    try {
      await stopImpersonation();
      setIsOpen(false);
    } catch (error) {
      console.error('Error stopping impersonation:', error);
    }
  };

  if (!session) {
    return <Button onClick={() => signIn()}>Sign In</Button>;
  }

  const userInitials = session.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={session.user?.image || undefined}
                alt={session.user?.name ?? ''}
              />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            {isImpersonating && (
              <div className='ring-background absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-500 ring-2' />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-max max-w-64 min-w-32'
          align='end'
          forceMount
        >
          {isImpersonating && (
            <>
              <DropdownMenuItem
                className='cursor-pointer text-orange-600 hover:text-orange-700'
                onSelect={handleStopImpersonation}
              >
                <UserX className='h-4 w-4' />
                <span className='grow'>Stop Impersonation</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            className='cursor-pointer'
            onSelect={() => setIsEditProfileOpen(true)}
          >
            <UserCog className='h-4 w-4' />
            <span className='grow'>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='cursor-pointer'
            onSelect={() => setIsNotificationSettingsOpen(true)}
          >
            <Bell className='h-4 w-4' />
            <span className='grow'>Notifications</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <ThemeSwitcher />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='cursor-pointer'
            onSelect={() => {
              toast({
                title: 'Signed out',
                description: 'You have been successfully logged out.',
              });
              signOut({ callbackUrl: '/' });
            }}
          >
            <LogOut className='h-4 w-4' />
            <span className='grow'>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
      <NotificationSettings
        isOpen={isNotificationSettingsOpen}
        onOpenChange={setIsNotificationSettingsOpen}
      />
    </>
  );
}
