import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (_: boolean) => void;
  selectedUser: { name: string; email: string } | null;
  emailSubject: string;
  setEmailSubject: (_: string) => void;
  emailBody: string;
  setEmailBody: (_: string) => void;
  isEmailSending: boolean;
  onSend: () => void;
}

export function EmailDialog({
  open,
  onOpenChange,
  selectedUser,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  isEmailSending,
  onSend,
}: EmailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Email to {selectedUser?.name}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div>
            <Label htmlFor='subject'>Subject</Label>
            <Input
              id='subject'
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder='Enter email subject...'
            />
          </div>
          <div>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              id='message'
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder='Enter your email message...'
              className='min-h-[200px]'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={isEmailSending}>
            {isEmailSending && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
