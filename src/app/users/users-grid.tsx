'use client';

import { Button } from '@/components/ui/button';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useImpersonation } from '@/components/contexts/impersonation-context';
import { useIsDarkTheme } from '@/hooks/use-is-dark-theme';
import { toast } from '@/hooks/use-toast';
import type { PaginatedResponse } from '@/types/pagination';
import type { User } from '@prisma/client';
import {
  AllCommunityModule,
  colorSchemeDark,
  ModuleRegistry,
  themeAlpine,
  type FilterChangedEvent,
  type RowValueChangedEvent,
  type SortChangedEvent,
  type SortDirection,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeleteUserDialog } from './DeleteUserDialog';
import { EmailDialog } from './EmailDialog';
import { defaultColDef, getColumnDefs } from './users-grid-columns';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export function UsersGrid() {
  const { startImpersonation } = useImpersonation();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortModel, setSortModel] = useState<
    { colId: string; sort: SortDirection | undefined }[]
  >([]);
  const [filterModel, setFilterModel] = useState<Record<string, unknown>>({});

  const gridRef = useRef<AgGridReact<User>>(null);
  const isDarkTheme = useIsDarkTheme();

  const agGridTheme = useMemo(
    () => (isDarkTheme ? themeAlpine.withPart(colorSchemeDark) : themeAlpine),
    [isDarkTheme]
  );

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/users', window.location.origin);
      url.searchParams.set('page', currentPage.toString());
      url.searchParams.set('pageSize', pageSize.toString());

      if (sortModel && sortModel.length > 0) {
        url.searchParams.set('sortModel', JSON.stringify(sortModel));
      }

      if (filterModel && Object.keys(filterModel).length > 0) {
        url.searchParams.set('filterModel', JSON.stringify(filterModel));
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch users');

      const result: PaginatedResponse<User> = await response.json();

      setUsers(result.data);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, sortModel, filterModel]);

  // Fetch users when pagination or sort changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handler functions for actions cell
  const handleSendEmailAction = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleSendNotificationAction = (user: User) => {
    handleSendTestNotification(user);
  };
  const handleDeleteAction = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };
  const handleImpersonateAction = async (user: User) => {
    try {
      await startImpersonation(user);
      toast({
        title: 'Impersonation Started',
        description: `You are now impersonating ${user.name}`,
      });
    } catch (error) {
      console.error('Error starting impersonation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start impersonation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const columnDefs = getColumnDefs({
    onSendEmail: handleSendEmailAction,
    onSendNotification: handleSendNotificationAction,
    onDelete: handleDeleteAction,
    onImpersonate: handleImpersonateAction,
    isSendingNotification,
    currentUserId: session?.user?.id,
  });

  const onSortChanged = useCallback((event: SortChangedEvent) => {
    const sortModel = event.api
      .getColumnState()
      .filter((col) => col.sort !== null && col.sort !== undefined)
      .map((col) => ({
        colId: col.colId,
        sort: col.sort,
      }));
    setSortModel(sortModel);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, []);

  // Handle filtering changes
  const onFilterChanged = useCallback((event: FilterChangedEvent) => {
    const filterModel = event.api.getFilterModel();
    setFilterModel(filterModel);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const updateUser = useCallback(
    async (userData: User) => {
      try {
        const response = await fetch(`/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error('Failed to update user');
        }

        const updatedUser = await response.json();
        toast({
          title: 'User Updated',
          description: `Successfully updated user ${updatedUser.name}`,
        });

        // Refresh the data after update
        await fetchUsers();

        return updatedUser;
      } catch (error) {
        console.error('Error updating user:', error);
        toast({
          title: 'Error',
          description: 'Failed to update user. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [fetchUsers]
  );

  const onRowValueChanged = useCallback(
    (event: RowValueChangedEvent<User, unknown>) => {
      if (event.data) {
        updateUser(event.data);
      }
    },
    [updateUser]
  );

  const handleSendEmail = async () => {
    if (!selectedUser) return;
    setIsEmailSending(true);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: selectedUser.email,
          name: selectedUser.name,
          subject: emailSubject,
          body: emailBody,
          template: 'message',
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      toast({
        title: 'Email Sent',
        description: `Email sent to ${selectedUser.email}`,
      });
      setIsModalOpen(false);
      setEmailSubject('');
      setEmailBody('');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/users?id=${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast({
        title: 'User Deleted',
        description: `Successfully deleted user ${userToDelete.name}`,
      });
      setIsDeleteModalOpen(false);
      setUserToDelete(null);

      // Refresh the data after deletion
      await fetchUsers();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendTestNotification = async (user: User) => {
    setIsSendingNotification(true);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: `This is a test notification sent to ${user.name} from the admin panel!`,
          targetUserId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Test notification sent!',
          description:
            result.sentTo > 0
              ? `Test notification sent to ${user.name} successfully.`
              : `No notification sent - ${user.name} may not be subscribed to push notifications.`,
        });
      } else {
        throw new Error('Notification sending failed');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Failed to send notification',
        description: 'There was an error sending the test notification.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingNotification(false);
    }
  };

  // Export CSV handler
  const handleExportCSV = async () => {
    try {
      // Get actually visible columns from the grid API (excluding action columns)
      const visibleColumns =
        gridRef.current?.api
          .getColumns()
          ?.filter((col) => {
            const colId = col.getColId();
            return col.isVisible() && colId !== 'actions' && colId;
          })
          .map((col) => col.getColId()) || [];

      const response = await fetch('/api/export-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'user',
          filterModel,
          columns: visibleColumns,
        }),
      });
      if (!response.ok) throw new Error('Failed to export CSV');
      const blob = await response.blob();
      // Native download approach
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Could not export users as CSV.',
        variant: 'destructive',
      });
    }
  };

  // Reset handler
  const handleReset = () => {
    try {
      // Clear all filters
      gridRef.current?.api.setFilterModel(null);

      // Clear all sorting
      gridRef.current?.api.applyColumnState({
        defaultState: { sort: null },
      });

      // Show all columns
      gridRef.current?.api.setColumnsVisible(
        gridRef.current.api.getColumns()?.map((col) => col.getColId()) || [],
        true
      );

      // Reset pagination
      setCurrentPage(1);

      // Clear local state
      setFilterModel({});
      setSortModel([]);

      toast({
        title: 'Grid Reset',
        description:
          'All filters, sorting, and column visibility have been reset.',
      });
    } catch (error) {
      console.error('Error resetting grid:', error);
      toast({
        title: 'Reset Failed',
        description: 'Could not reset the grid.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='h-full w-full px-4 py-8'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Users</h1>
        <div className='flex gap-2'>
          <Button variant='secondary' onClick={handleReset}>
            Reset
          </Button>
          <Button variant='default' onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>
      <div className='bg-background overflow-hidden rounded-md border'>
        <div className='ag-theme-alpine'>
          <AgGridReact<User>
            ref={gridRef}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowData={users}
            pagination={false}
            animateRows={true}
            onRowValueChanged={onRowValueChanged}
            onSortChanged={onSortChanged}
            onFilterChanged={onFilterChanged}
            theme={agGridTheme}
            domLayout='autoHeight'
            editType='fullRow'
            loading={isLoading}
            suppressPaginationPanel={true}
          />
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>
      <EmailDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedUser={
          selectedUser
            ? { name: selectedUser.name ?? '', email: selectedUser.email }
            : null
        }
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
        emailBody={emailBody}
        setEmailBody={setEmailBody}
        isEmailSending={isEmailSending}
        onSend={handleSendEmail}
      />
      <DeleteUserDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        userToDelete={userToDelete ? { name: userToDelete.name ?? '' } : null}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
