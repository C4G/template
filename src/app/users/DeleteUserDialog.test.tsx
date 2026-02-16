import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DeleteUserDialog } from './DeleteUserDialog';

describe('DeleteUserDialog', () => {
  // Setup function following SIFERS pattern
  function setup(
    props?: Partial<{
      isOpen: boolean;
      userToDelete: { name: string } | null;
      isLoading: boolean;
    }>
  ) {
    const defaultProps = {
      isOpen: true,
      onOpenChange: vi.fn(),
      userToDelete: { name: 'John Doe' },
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      isLoading: false,
      ...props,
    };

    return {
      user: userEvent.setup(),
      ...render(<DeleteUserDialog {...defaultProps} />),
      props: defaultProps,
    };
  }

  it('renders with user name in description', () => {
    // Setup & Invoke
    setup();

    // Find & Expect
    expect(screen.getByText('Delete User')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    // Setup & Invoke
    setup({ isLoading: true });

    // Find & Expect
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
  });

  it('calls onConfirm when Delete button is clicked', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Expect
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Expect
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    // Setup & Invoke
    setup({ isOpen: false });

    // Find & Expect
    expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
  });

  it('handles null userToDelete gracefully', () => {
    // Setup & Invoke
    setup({ userToDelete: null });

    // Find & Expect
    expect(screen.getByText('Delete User')).toBeInTheDocument();
  });
});
