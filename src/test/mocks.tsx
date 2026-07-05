import type { Session } from '@/lib/auth';
import { User } from '@prisma/client';
import { vi } from 'vitest';

// Mock user factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: false,
  image: null,
  role: null,
  pushSubscription: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Mock session factory
export const createMockSession = (overrides?: Partial<Session>): Session => ({
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: false,
    image: null,
    role: 'ADMIN',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  session: {
    id: 'session-123',
    token: 'session-token-123',
    userId: 'user-123',
    expiresAt: new Date('2025-12-31'),
    ipAddress: null,
    userAgent: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  ...overrides,
});

// Mock the Better Auth client
export const mockUseSession = vi.fn();
export const mockSignOut = vi.fn();
export const mockSignInEmail = vi.fn();
export const mockSignInSocial = vi.fn();
export const mockSignUpEmail = vi.fn();
vi.mock('@/lib/auth-client', () => ({
  authClient: {},
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  signIn: {
    email: (...args: unknown[]) => mockSignInEmail(...args),
    social: (...args: unknown[]) => mockSignInSocial(...args),
  },
  signUp: {
    email: (...args: unknown[]) => mockSignUpEmail(...args),
  },
}));

// Mock next/navigation
export const mockPush = vi.fn();
export const mockReplace = vi.fn();
export const mockRefresh = vi.fn();
export const mockUsePathname = vi.fn(() => '/test-path');
export const mockUseRouter = vi.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  refresh: mockRefresh,
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}));
export const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT: ${url}`);
});

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
  redirect: (url: string) => mockRedirect(url),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock toast
export const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
  toast: mockToast,
}));

// Mock impersonation context
export const mockStartImpersonation = vi.fn();
export const mockStopImpersonation = vi.fn();
vi.mock('@/components/contexts/impersonation-context', () => ({
  useImpersonation: () => ({
    impersonatedUser: null,
    isImpersonating: false,
    startImpersonation: mockStartImpersonation,
    stopImpersonation: mockStopImpersonation,
  }),
  ImpersonationProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock AG Grid
vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid='ag-grid-mock'>{children}</div>
  ),
}));

vi.mock('ag-grid-community', () => ({
  ModuleRegistry: {
    registerModules: vi.fn(),
  },
  AllCommunityModule: {},
  themeAlpine: {
    withPart: vi.fn(() => 'theme-alpine-dark'),
  },
  colorSchemeDark: {},
}));

// Mock theme
vi.mock('@/hooks/use-is-dark-theme', () => ({
  useIsDarkTheme: () => false,
}));

// Reset all mocks helper
export const resetAllMocks = () => {
  mockUseSession.mockReset();
  mockSignOut.mockReset();
  mockSignInEmail.mockReset();
  mockSignInSocial.mockReset();
  mockSignUpEmail.mockReset();
  mockPush.mockReset();
  mockReplace.mockReset();
  mockRefresh.mockReset();
  mockUsePathname.mockReset();
  mockUseRouter.mockReset();
  mockRedirect.mockReset();
  mockToast.mockReset();
  mockStartImpersonation.mockReset();
  mockStopImpersonation.mockReset();
};
