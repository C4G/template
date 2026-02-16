'use client';

import { useTheme } from 'next-themes';

export function useIsDarkTheme() {
  const { theme, systemTheme } = useTheme();

  const isDarkTheme =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  return isDarkTheme;
}
