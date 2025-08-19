/**
 * Theme Store using Zustand
 * Global theme state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Theme } from '@/types/enums';
import { lightTheme, darkTheme } from '@/styles/themes';

type ThemeObject = typeof lightTheme;

interface ThemeState {
  themeMode: Theme;
  currentTheme: ThemeObject;
  isDark: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  applyTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const getCurrentThemeMode = (themeMode: Theme): 'light' | 'dark' => {
  if (themeMode === 'system') {
    return getSystemTheme();
  }
  return themeMode as 'light' | 'dark';
};

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        themeMode: 'system' as Theme,
        currentTheme: lightTheme,
        isDark: false,
        
        setTheme: (theme: Theme) => {
          const currentMode = getCurrentThemeMode(theme);
          const isDark = currentMode === 'dark';
          const currentTheme = isDark ? darkTheme : lightTheme;
          
          set({
            themeMode: theme,
            currentTheme,
            isDark,
          });
          
          // Apply theme immediately
          get().applyTheme();
        },
        
        toggleTheme: () => {
          const { isDark } = get();
          const newTheme = isDark ? 'light' : 'dark';
          get().setTheme(newTheme);
        },
        
        applyTheme: () => {
          const { currentTheme, isDark } = get();
          const root = document.documentElement;
          
          // Apply dark class
          if (isDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
          
          // Set CSS custom properties for theme colors
          Object.entries(currentTheme.colors).forEach(([category, colors]) => {
            if (typeof colors === 'object') {
              Object.entries(colors).forEach(([shade, value]) => {
                root.style.setProperty(`--color-${category}-${shade}`, value);
              });
            } else {
              root.style.setProperty(`--color-${category}`, colors as string);
            }
          });
          
          // Set other theme properties
          Object.entries(currentTheme.spacing).forEach(([key, value]) => {
            root.style.setProperty(`--spacing-${key}`, value);
          });
          
          Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
            root.style.setProperty(`--border-radius-${key}`, value);
          });
          
          Object.entries(currentTheme.shadows).forEach(([key, value]) => {
            root.style.setProperty(`--shadow-${key}`, value);
          });
        },
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({ themeMode: state.themeMode }), // Only persist theme mode
      }
    ),
    {
      name: 'theme-store',
    }
  )
);

// Initialize theme on store creation
useThemeStore.getState().applyTheme();

// Watch for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.themeMode === 'system') {
      state.setTheme('system'); // Re-apply system theme
    }
  });
}

// Convenience hooks
export const useTheme = () => {
  const { currentTheme, isDark, toggleTheme, setTheme } = useThemeStore();
  return { 
    theme: currentTheme, 
    isDark, 
    toggleTheme, 
    setTheme 
  };
};