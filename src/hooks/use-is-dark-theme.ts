'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useIsDarkTheme() {
  const { theme, systemTheme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const isDark =
      theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

    setIsDarkTheme(isDark);
  }, [theme, systemTheme]);

  return isDarkTheme;
}
