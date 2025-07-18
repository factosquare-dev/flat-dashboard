// Design tokens and theme configuration
export const theme = {
  colors: {
    // Primary colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    
    // Gray colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    
    // Semantic colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px
  },
  
  fontSizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
  
  transitions: {
    fast: '100ms ease-in-out',
    standard: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    modal: '1000',
    popover: '1100',
    tooltip: '1200',
    notification: '1300',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Component-specific themes
export const componentThemes = {
  button: {
    sizes: {
      sm: {
        padding: '0.5rem 0.75rem',
        fontSize: theme.fontSizes.sm,
        borderRadius: theme.borderRadius.md,
      },
      md: {
        padding: '0.5rem 1rem',
        fontSize: theme.fontSizes.sm,
        borderRadius: theme.borderRadius.md,
      },
      lg: {
        padding: '0.75rem 1.5rem',
        fontSize: theme.fontSizes.md,
        borderRadius: theme.borderRadius.lg,
      },
    },
  },
  
  card: {
    variants: {
      default: {
        backgroundColor: '#ffffff',
        border: `1px solid ${theme.colors.gray[200]}`,
        borderRadius: theme.borderRadius.xl,
        boxShadow: theme.shadows.sm,
      },
      elevated: {
        backgroundColor: '#ffffff',
        border: `1px solid ${theme.colors.gray[200]}`,
        borderRadius: theme.borderRadius.xl,
        boxShadow: theme.shadows.md,
      },
      outlined: {
        backgroundColor: 'transparent',
        border: `1px solid ${theme.colors.gray[300]}`,
        borderRadius: theme.borderRadius.xl,
        boxShadow: theme.shadows.none,
      },
    },
  },
  
  modal: {
    sizes: {
      sm: { maxWidth: '28rem' },
      md: { maxWidth: '32rem' },
      lg: { maxWidth: '42rem' },
      xl: { maxWidth: '56rem' },
      full: { maxWidth: '100%' },
    },
  },
  
  input: {
    sizes: {
      sm: {
        padding: '0.5rem 0.75rem',
        fontSize: theme.fontSizes.sm,
      },
      md: {
        padding: '0.625rem 1rem',
        fontSize: theme.fontSizes.sm,
      },
      lg: {
        padding: '0.75rem 1.25rem',
        fontSize: theme.fontSizes.md,
      },
    },
  },
} as const;

// Type definitions for theme
export type Theme = typeof theme;
export type ComponentThemes = typeof componentThemes;
export type ThemeColor = keyof typeof theme.colors;
export type ColorShade = keyof typeof theme.colors.primary;
export type Spacing = keyof typeof theme.spacing;
export type FontSize = keyof typeof theme.fontSizes;
export type BorderRadius = keyof typeof theme.borderRadius;
export type Shadow = keyof typeof theme.shadows;
export type Transition = keyof typeof theme.transitions;
export type ZIndex = keyof typeof theme.zIndex;
export type Breakpoint = keyof typeof theme.breakpoints;