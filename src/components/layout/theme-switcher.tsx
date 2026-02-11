'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeSwitcher() {
  const { setTheme, theme, systemTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(
      theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
        ? 'light'
        : 'dark'
    );
  };

  return (
    <div
      onClick={toggleTheme}
      className='focus:bg-accent focus:text-accent-foreground relative flex grow cursor-pointer items-center rounded-sm text-sm outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50'
    >
      <Sun className='mr-2 h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
      <Moon className='absolute mr-2 h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
      <span className='grow'>
        {theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
          ? 'Dark'
          : 'Light'}{' '}
        Mode
      </span>
    </div>
  );
}
