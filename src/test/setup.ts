import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock fetch globally for NextAuth session requests
global.fetch = vi.fn((url) => {
  // Mock NextAuth session endpoint
  if (typeof url === 'string' && url.includes('/api/auth/session')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ user: null }),
    } as Response);
  }
  // Return empty response for other requests
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({}),
  } as Response);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

// Suppress console errors and warnings globally
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: any[]) => {
    // Suppress known test warnings
    const message = args[0]?.toString() || '';
    if (
      message.includes('Not wrapped in act(') ||
      message.includes('update to SessionProvider') ||
      message.includes('ClientFetchError') ||
      message.includes('Failed to parse URL') ||
      message.includes('Missing `Description`') ||
      message.includes('wrap-tests-with-act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('Missing `Description`')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterEach(() => {
  cleanup();
});
