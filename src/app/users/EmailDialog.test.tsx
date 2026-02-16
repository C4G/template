import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmailDialog } from './EmailDialog';

describe('EmailDialog', () => {
  // Setup function following SIFERS pattern
  function setup(
    props?: Partial<{
      open: boolean;
      emailSubject: string;
      emailBody: string;
      isEmailSending: boolean;
    }>
  ) {
    const defaultProps = {
      open: true,
      onOpenChange: vi.fn(),
      selectedUser: { name: 'Jane Smith', email: 'jane@example.com' },
      emailSubject: '',
      setEmailSubject: vi.fn(),
      emailBody: '',
      setEmailBody: vi.fn(),
      isEmailSending: false,
      onSend: vi.fn(),
      ...props,
    };

    return {
      user: userEvent.setup(),
      ...render(<EmailDialog {...defaultProps} />),
      props: defaultProps,
    };
  }

  it('renders with user name in title', () => {
    // Setup & Invoke
    setup();

    // Find & Expect
    expect(screen.getByText(/Send Email to Jane Smith/i)).toBeInTheDocument();
  });

  it('updates subject when input changes', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const subjectInput = screen.getByLabelText(/subject/i);
    await user.type(subjectInput, 'Test Subject');

    // Expect
    expect(props.setEmailSubject).toHaveBeenCalled();
  });

  it('updates body when textarea changes', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const messageTextarea = screen.getByLabelText(/message/i);
    await user.type(messageTextarea, 'Test message body');

    // Expect
    expect(props.setEmailBody).toHaveBeenCalled();
  });

  it('calls onSend when Send button is clicked', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Expect
    expect(props.onSend).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isEmailSending is true', () => {
    // Setup & Invoke
    setup({ isEmailSending: true });

    // Find & Expect
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('calls onOpenChange when Cancel button is clicked', async () => {
    // Setup & Invoke
    const { user, props } = setup();

    // Find
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Expect
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not render when open is false', () => {
    // Setup & Invoke
    setup({ open: false });

    // Find & Expect
    expect(screen.queryByText(/Send Email to/i)).not.toBeInTheDocument();
  });

  it('displays current subject value', () => {
    // Setup & Invoke
    setup({ emailSubject: 'Current Subject' });

    // Find & Expect
    const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
    expect(subjectInput.value).toBe('Current Subject');
  });

  it('displays current body value', () => {
    // Setup & Invoke
    setup({ emailBody: 'Current body text' });

    // Find & Expect
    const messageTextarea = screen.getByLabelText(
      /message/i
    ) as HTMLTextAreaElement;
    expect(messageTextarea.value).toBe('Current body text');
  });
});
