import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BanUserDialog } from './BanUserDialog';

describe('BanUserDialog', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    userToBan: { name: 'Test User' },
    onConfirm: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  };

  it('renders shadcn inputs and user details', () => {
    render(<BanUserDialog {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: 'Ban User' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Reason')).toBeInTheDocument();
    expect(screen.getByLabelText('Ban ends')).toHaveAttribute(
      'type',
      'datetime-local'
    );
  });

  it('requires a reason', async () => {
    const user = userEvent.setup();
    render(<BanUserDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Ban User' }));

    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'A reason is required.'
    );
  });

  it('submits the reason and end time', async () => {
    const user = userEvent.setup();
    render(<BanUserDialog {...defaultProps} />);

    await user.type(screen.getByLabelText('Reason'), 'Abuse of service');
    await user.type(screen.getByLabelText('Ban ends'), '2030-01-01T12:00');
    await user.click(screen.getByRole('button', { name: 'Ban User' }));

    expect(defaultProps.onConfirm).toHaveBeenCalledWith({
      banReason: 'Abuse of service',
      banExpiresAt: '2030-01-01T12:00',
    });
  });
});
