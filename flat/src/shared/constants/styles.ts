/**
 * Centralized style constants for consistent theming
 */

// Color constants
export const COLORS = {
  // Primary colors
  primary: {
    50: 'blue-50',
    100: 'blue-100',
    500: 'blue-500',
    600: 'blue-600',
    700: 'blue-700',
  },
  
  // Neutral colors
  neutral: {
    50: 'gray-50',
    100: 'gray-100',
    200: 'gray-200',
    300: 'gray-300',
    400: 'gray-400',
    500: 'gray-500',
    600: 'gray-600',
    700: 'gray-700',
    800: 'gray-800',
    900: 'gray-900',
  },
  
  // Status colors
  success: {
    50: 'green-50',
    500: 'green-500',
    600: 'green-600',
  },
  
  warning: {
    50: 'yellow-50',
    500: 'yellow-500',
    600: 'yellow-600',
  },
  
  error: {
    50: 'red-50',
    500: 'red-500',
    600: 'red-600',
  },
} as const;

// Spacing constants
export const SPACING = {
  xs: '1',
  sm: '2',
  md: '4',
  lg: '6',
  xl: '8',
  '2xl': '10',
  '3xl': '12',
} as const;

// Border radius constants
export const RADIUS = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const;

// Shadow constants
export const SHADOW = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  none: 'shadow-none',
} as const;

// Common style combinations
export const STYLES = {
  button: {
    base: 'transition-colors duration-200',
    primary: `bg-${COLORS.primary[600]} hover:bg-${COLORS.primary[700]} text-white`,
    secondary: `bg-${COLORS.neutral[100]} hover:bg-${COLORS.neutral[200]} text-${COLORS.neutral[700]}`,
    danger: `bg-${COLORS.error[600]} hover:bg-${COLORS.error[700]} text-white`,
  },
  
  input: {
    base: `border ${RADIUS.md} px-${SPACING.md} py-${SPACING.sm}`,
    focus: `focus:outline-none focus:ring-2 focus:ring-${COLORS.primary[500]}`,
  },
  
  card: {
    base: `bg-white ${RADIUS.lg} ${SHADOW.md} p-${SPACING.lg}`,
  },
  
  badge: {
    base: `inline-flex items-center px-${SPACING.sm} py-${SPACING.xs} ${RADIUS.md} text-sm font-medium`,
  },
} as const;

// Layout constants
export const LAYOUT = {
  maxWidth: {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  },
  
  container: {
    padding: `px-${SPACING.md} sm:px-${SPACING.lg} lg:px-${SPACING.xl}`,
  },
} as const;

// Animation constants
export const ANIMATION = {
  transition: {
    fast: 'transition-all duration-150',
    base: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },
  
  fade: {
    in: 'animate-fadeIn',
    out: 'animate-fadeOut',
  },
  
  spin: 'animate-spin',
  pulse: 'animate-pulse',
} as const;