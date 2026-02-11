import { ConfirmationDialog } from '@/components/layout/confirmation-dialog';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (_: boolean) => void;
  userToDelete: { name: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function DeleteUserDialog({
  isOpen,
  onOpenChange,
  userToDelete,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteUserDialogProps) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Delete User'
      description={`Are you sure you want to delete <strong>${userToDelete?.name}</strong>? This action cannot be undone.`}
      confirmText='Delete'
      cancelText='Cancel'
      confirmVariant='destructive'
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
}
