import { createMockUser } from '@/test/mocks';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserActionsCell } from './UserActionsCell';

describe('UserActionsCell', () => {
  const mockUser = createMockUser({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  });

  // Setup function following SIFERS pattern
  function setup(
    props?: Partial<{
      data: typeof mockUser | undefined;
      currentUserId: string;
      isSendingNotification: boolean;
    }>
  ) {
    const defaultProps = {
      data: mockUser,
      onSendEmail: vi.fn(),
      onSendNotification: vi.fn(),
      onDelete: vi.fn(),
      onImpersonate: vi.fn(),
      isSendingNotification: false,
      currentUserId: 'different-user-id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      colDef: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      column: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      columnApi: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: {} as any,
      getValue: vi.fn(),
      setValue: vi.fn(),
      formatValue: vi.fn(),
      value: undefined,
      valueFormatted: undefined,
      registerRowDragger: vi.fn(),
      setTooltip: vi.fn(),
      rowIndex: 0,
      eGridCell: document.createElement('div'),
      eParentOfValue: document.createElement('div'),
      ...props,
    };

    return {
      user: userEvent.setup(),
      ...render(<UserActionsCell {...defaultProps} />),
      props: defaultProps,
    };
  }

  it('renders dropdown menu trigger', () => {
    // Setup & Invoke
    setup();

    // Find & Expect
    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
  });

  it('opens menu and shows all action items', async () => {
    // Setup & Invoke
    const { user } = setup();

    // Find
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Expect
    expect(screen.getByText(/Impersonate User/i)).toBeInTheDocument();
    expect(screen.getByText(/Send Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Send Test Notification/i)).toBeInTheDocument();
    expect(screen.getByText(/Delete User/i)).toBeInTheDocument();
  });

  it('hides Impersonate option for current user', async () => {
    // Setup & Invoke
    const { user } = setup({ currentUserId: 'user-123' });

    // Find
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Expect
    expect(screen.queryByText(/Impersonate User/i)).not.toBeInTheDocument();
  });

  it('calls onSendEmail when Send Email is clicked', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const emailOption = screen.getByText(/Send Email/i);
    await user.click(emailOption);

    // Expect
    expect(props.onSendEmail).toHaveBeenCalledWith(mockUser);
  });

  it('calls onSendNotification when Send Test Notification is clicked', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const notificationOption = screen.getByText(/Send Test Notification/i);
    await user.click(notificationOption);

    // Expect
    expect(props.onSendNotification).toHaveBeenCalledWith(mockUser);
  });

  it('calls onDelete when Delete User is clicked', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const deleteOption = screen.getByText(/Delete User/i);
    await user.click(deleteOption);

    // Expect
    expect(props.onDelete).toHaveBeenCalledWith(mockUser);
  });

  it('calls onImpersonate when Impersonate User is clicked', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const impersonateOption = screen.getByText(/Impersonate User/i);
    await user.click(impersonateOption);

    // Expect
    expect(props.onImpersonate).toHaveBeenCalledWith(mockUser);
  });

  it('disables notification button when isSendingNotification is true', async () => {
    // Setup & Invoke
    const { user } = setup({ isSendingNotification: true });

    // Find
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const notificationOption = screen.getByText(/Send Test Notification/i);
    // Expect - Check that the menu item has data-disabled attribute (value might be empty string or "true")
    expect(notificationOption.closest('[role="menuitem"]')).toHaveAttribute(
      'data-disabled'
    );
  });

  it('returns null when data is not provided', () => {
    // Setup & Invoke
    const { container } = setup({ data: undefined });

    // Find & Expect
    // Component returns null, but theme provider scripts are still in container
    // Check that there's no button element (the actual component content)
    expect(container.querySelector('button')).toBeNull();
  });
});
