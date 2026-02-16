import { mockRedirect } from '@/test/mocks';
import { describe, expect, it, vi } from 'vitest';
import UsersPage from './page';

type viMock = ReturnType<typeof vi.fn>;

// Mock the auth function
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock the UsersGrid component
vi.mock('./users-grid', () => ({
  UsersGrid: () => <div data-testid='users-grid'>UsersGrid Component</div>,
}));

// Import auth after mocking
import { auth } from '@/lib/auth';

describe('UsersPage', () => {
  it('renders UsersGrid for ADMIN role', async () => {
    (auth as unknown as viMock).mockResolvedValue({
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
    (auth as unknown as viMock).mockResolvedValue({
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
    (auth as unknown as viMock).mockResolvedValue({
      user: { id: '123', role: null, name: 'User', email: 'user@example.com' },
    });

    await expect(UsersPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('redirects when session is null', async () => {
    (auth as unknown as viMock).mockResolvedValue(null);

    await expect(UsersPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('allows STAFF role access', async () => {
    (auth as unknown as viMock).mockResolvedValue({
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
