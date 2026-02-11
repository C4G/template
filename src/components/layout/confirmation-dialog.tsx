'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

/**
 * Props interface for the ConfirmationDialog component
 */
export interface ConfirmationDialogProps {
  /** Controls whether the dialog is open or closed */
  isOpen: boolean;
  /** Callback function called when the dialog open state changes */
  onOpenChange: (_open: boolean) => void;
  /** The title text displayed in the dialog header */
  title: string;
  /** The description text displayed in the dialog body. Supports HTML content. */
  description: string;
  /** Text for the confirm button. Defaults to 'Confirm' */
  confirmText?: string;
  /** Text for the cancel button. Defaults to 'Cancel' */
  cancelText?: string;
  /** Button variant for the confirm button. Defaults to 'default' */
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  /** Callback function called when the confirm button is clicked */
  onConfirm: () => void;
  /** Optional callback function called when the cancel button is clicked. If not provided, defaults to closing the dialog */
  onCancel?: () => void;
  /** Whether the dialog is in a loading state (shows spinner and disables buttons). Defaults to false */
  isLoading?: boolean;
  /** Whether the confirm button should be disabled. Defaults to false */
  disabled?: boolean;
}

/**
 * A reusable confirmation dialog component that displays a modal with customizable content
 * and action buttons. Supports loading states, custom button variants, and HTML content in descriptions.
 *
 * @param props - The props object containing all configuration options
 * @returns A React functional component that renders a confirmation dialog
 *
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   isOpen={isDeleteModalOpen}
 *   onOpenChange={setIsDeleteModalOpen}
 *   title="Delete User"
 *   description="Are you sure you want to delete <strong>John Doe</strong>? This action cannot be undone."
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   confirmVariant="destructive"
 *   onConfirm={handleDeleteUser}
 *   isLoading={isDeleting}
 * />
 * ```
 */
export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  onConfirm,
  onCancel,
  isLoading = false,
  disabled = false,
}: ConfirmationDialogProps) {
  /**
   * Handles the cancel action by calling the provided onCancel callback
   * or defaulting to closing the dialog if no callback is provided
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div
          className='text-muted-foreground text-sm'
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <DialogFooter>
          <Button variant='outline' onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading || disabled}
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
