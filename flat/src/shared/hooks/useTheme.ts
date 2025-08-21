import { useEffect } from 'react';
import { useStore } from '@/store';
import { lightTheme, darkTheme } from '@/styles/themes';
import { Theme } from '@/shared/types/enums';

type ThemeObject = typeof lightTheme;

export const useTheme = () => {
  const { theme: themeMode, setTheme: setThemeMode } = useStore();
  
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const getCurrentTheme = () => {
    if (themeMode === 'system') {
      return getSystemTheme();
    }
    return themeMode;
  };

  const isDark = getCurrentTheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS custom properties for theme colors
    Object.entries(theme.colors).forEach(([category, colors]) => {
      if (typeof colors === 'object') {
        Object.entries(colors).forEach(([shade, value]) => {
          root.style.setProperty(`--color-${category}-${shade}`, value);
        });
      } else {
        root.style.setProperty(`--color-${category}`, colors);
      }
    });

    // Set other theme properties
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }, [theme, isDark]);

  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // Force a re-render when system theme changes
        setThemeMode('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode, setThemeMode]);

  return { 
    theme, 
    isDark, 
    toggleTheme, 
    setTheme: setThemeMode 
  };
};