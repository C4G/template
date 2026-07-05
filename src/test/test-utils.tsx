import { ImpersonationProvider } from '@/components/contexts/impersonation-context';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <ImpersonationProvider>{children}</ImpersonationProvider>
    </ThemeProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders>{children}</AllTheProviders>,
    ...options,
  });
};

export * from '@testing-library/react';
export { customRender as render };
