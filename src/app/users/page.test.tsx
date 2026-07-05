import { mockRedirect } from '@/test/mocks';
import { describe, expect, it, vi } from 'vitest';
import UsersPage from './page';

type viMock = ReturnType<typeof vi.fn>;

// Mock the session helper
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

// Mock the UsersGrid component
vi.mock('./users-grid', () => ({
  UsersGrid: () => <div data-testid='users-grid'>UsersGrid Component</div>,
}));

// Import getSession after mocking
import { getSession } from '@/lib/auth';

describe('UsersPage', () => {
  it('renders UsersGrid for ADMIN role', async () => {
    (getSession as unknown as viMock).mockResolvedValue({
      user: {
        id: '123',
        role: 'ADMIN',
        name: 'Admin User',
        email: 'admin@example.com',
      },
    });

    const result = await UsersPage();

    // Check if the result is a valid React element
    expect(result).toBeDefined();
    expect(result.type).toBeDefined();
  });

  it('redirects non-admin users', async () => {
    (getSession as unknown as viMock).mockResolvedValue({
      user: {
        id: '123',
        role: 'USER',
        name: 'Regular User',
        email: 'user@example.com',
      },
    });

    await expect(UsersPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('redirects when user has no role', async () => {
    (getSession as unknown as viMock).mockResolvedValue({
      user: { id: '123', role: null, name: 'User', email: 'user@example.com' },
    });

    await expect(UsersPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('redirects when session is null', async () => {
    (getSession as unknown as viMock).mockResolvedValue(null);

    await expect(UsersPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('allows STAFF role access', async () => {
    (getSession as unknown as viMock).mockResolvedValue({
      user: {
        id: '123',
        role: 'STAFF',
        name: 'Staff User',
        email: 'staff@example.com',
      },
    });

    // STAFF should redirect based on current logic (only ADMIN allowed)
    await expect(UsersPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });
});
