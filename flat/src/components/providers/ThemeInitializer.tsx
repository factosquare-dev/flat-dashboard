import { useEffect } from 'react';
import { useTheme } from '@/shared/hooks/useTheme';

export const ThemeInitializer = () => {
  // Just call useTheme to trigger the side effects
  useTheme();
  
  return null;
};