/**
 * FLAT Design System Tokens
 * Centralized design tokens for consistent UI across the application
 */

// ========================================
// Color System
// ========================================

export const colors = {
  // Brand Colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Neutral Colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Special Colors
  purple: {
    100: '#EDE9FE',
    200: '#DDD6FE',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
  },
  
  // Functional Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ========================================
// Typography
// ========================================

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ========================================
// Spacing System
// ========================================

export const spacing = {
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
} as const;

// ========================================
// Component Sizes
// ========================================

export const sizes = {
  button: {
    sm: {
      height: '2rem',      // 32px
      paddingX: '0.75rem', // 12px
      fontSize: '0.875rem', // 14px
    },
    md: {
      height: '2.5rem',    // 40px
      paddingX: '1rem',    // 16px
      fontSize: '0.875rem', // 14px
    },
    lg: {
      height: '3rem',      // 48px
      paddingX: '1.5rem',  // 24px
      fontSize: '1rem',    // 16px
    },
  },
  
  input: {
    sm: {
      height: '2rem',      // 32px
      paddingX: '0.75rem', // 12px
      fontSize: '0.875rem', // 14px
    },
    md: {
      height: '2.5rem',    // 40px
      paddingX: '1rem',    // 16px
      fontSize: '0.875rem', // 14px
    },
    lg: {
      height: '3rem',      // 48px
      paddingX: '1rem',    // 16px
      fontSize: '1rem',    // 16px
    },
  },
  
  modal: {
    sm: '24rem',   // 384px
    md: '32rem',   // 512px
    lg: '48rem',   // 768px
    xl: '64rem',   // 1024px
  },
} as const;

// ========================================
// Border Radius
// ========================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// ========================================
// Shadows
// ========================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
} as const;

// ========================================
// Z-Index
// ========================================

export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 1000,
  sticky: 1020,
  modal: 1030,
  popover: 1040,
  tooltip: 1050,
} as const;

// ========================================
// Transitions
// ========================================

export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
} as const;

// ========================================
// Semantic Tokens
// ========================================

export const semanticTokens = {
  // Status Colors
  status: {
    planning: {
      bg: colors.gray[100],
      text: colors.gray[700],
      border: colors.gray[300],
    },
    inProgress: {
      bg: colors.primary[100],
      text: colors.primary[700],
      border: colors.primary[300],
    },
    completed: {
      bg: colors.success[100],
      text: colors.success[700],
      border: colors.success[300],
    },
    cancelled: {
      bg: colors.error[100],
      text: colors.error[700],
      border: colors.error[300],
    },
  },
  
  // Priority Colors
  priority: {
    high: {
      bg: colors.error[100],
      text: colors.error[700],
      border: colors.error[300],
    },
    medium: {
      bg: colors.warning[100],
      text: colors.warning[700],
      border: colors.warning[300],
    },
    low: {
      bg: colors.success[100],
      text: colors.success[700],
      border: colors.success[300],
    },
  },
  
  // Factory Colors
  factory: {
    manufacturing: colors.primary[500],
    container: colors.success[500],
    packaging: colors.purple[500],
    default: colors.gray[500],
  },
} as const;

// Type exports for TypeScript
export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Size = typeof sizes;
export type BorderRadius = typeof borderRadius;
export type Shadow = typeof shadows;
export type ZIndex = typeof zIndex;
export type Transition = typeof transitions;
export type SemanticToken = typeof semanticTokens;