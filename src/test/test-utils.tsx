import { ImpersonationProvider } from '@/components/contexts/impersonation-context';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { render, RenderOptions } from '@testing-library/react';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ReactElement, ReactNode } from 'react';

interface AllTheProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

function AllTheProviders({ children, session }: AllTheProvidersProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <ImpersonationProvider>{children}</ImpersonationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null;
}

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const { session, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders session={session}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
