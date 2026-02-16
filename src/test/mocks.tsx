import { User } from '@prisma/client';
import { Session } from 'next-auth';
import { vi } from 'vitest';

// Mock user factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: null,
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
    role: 'ADMIN',
  },
  expires: '2025-12-31',
  ...overrides,
});

// Mock next-auth
export const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
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
