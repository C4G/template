import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@prisma/client';
import type { ICellRendererParams } from 'ag-grid-community';
import {
  Ban,
  Bell,
  Mail,
  MoreHorizontal,
  ShieldCheck,
  Trash2,
  UserCheck,
} from 'lucide-react';

interface UserActionsCellProps extends ICellRendererParams<User> {
  onSendEmail: (_: User) => void;
  onSendNotification: (_: User) => void;
  onDelete: (_: User) => void;
  onImpersonate: (_: User) => void;
  onBan: (_: User) => void;
  onUnban: (_: User) => void;
  isSendingNotification: boolean;
  isBanning: boolean;
  currentUserId?: string;
}

export function UserActionsCell({
  data,
  onSendEmail,
  onSendNotification,
  onDelete,
  onImpersonate,
  onBan,
  onUnban,
  isSendingNotification,
  isBanning,
  currentUserId,
}: UserActionsCellProps) {
  if (!data) return null;

  const isCurrentUser = currentUserId === data.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {!isCurrentUser && (
          <DropdownMenuItem
            onClick={() => onImpersonate(data)}
            className='text-orange-600 hover:text-orange-700'
          >
            <UserCheck className='mr-2 h-4 w-4' />
            Impersonate User
          </DropdownMenuItem>
        )}
        {!isCurrentUser &&
          (data.banned ? (
            <DropdownMenuItem
              onClick={() => onUnban(data)}
              disabled={isBanning}
            >
              <ShieldCheck className='mr-2 h-4 w-4' />
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => onBan(data)}
              disabled={isBanning}
              className='text-destructive'
            >
              <Ban className='mr-2 h-4 w-4' />
              Ban User
            </DropdownMenuItem>
          ))}
        <DropdownMenuItem onClick={() => onSendEmail(data)}>
          <Mail className='mr-2 h-4 w-4' />
          Send Email
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSendNotification(data)}
          disabled={isSendingNotification}
        >
          <Bell className='mr-2 h-4 w-4' />
          Send Test Notification
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(data)}
          className='text-destructive'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
