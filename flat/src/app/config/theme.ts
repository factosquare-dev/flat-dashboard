/**
 * Unified Theme Configuration for FLAT Dashboard
 * This file provides TypeScript access to CSS variables defined in theme.css
 */

import { PROJECT_STATUS, PROJECT_PRIORITY } from '@/shared/constants/project';

export const theme = {
  colors: {
    primary: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      200: 'var(--color-primary-200)',
      300: 'var(--color-primary-300)',
      400: 'var(--color-primary-400)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)',
    },
    secondary: {
      50: 'var(--color-secondary-50)',
      100: 'var(--color-secondary-100)',
      200: 'var(--color-secondary-200)',
      300: 'var(--color-secondary-300)',
      400: 'var(--color-secondary-400)',
      500: 'var(--color-secondary-500)',
      600: 'var(--color-secondary-600)',
      700: 'var(--color-secondary-700)',
      800: 'var(--color-secondary-800)',
      900: 'var(--color-secondary-900)',
    },
    success: {
      50: 'var(--color-success-50)',
      100: 'var(--color-success-100)',
      200: 'var(--color-success-200)',
      300: 'var(--color-success-300)',
      400: 'var(--color-success-400)',
      500: 'var(--color-success-500)',
      600: 'var(--color-success-600)',
      700: 'var(--color-success-700)',
      800: 'var(--color-success-800)',
      900: 'var(--color-success-900)',
    },
    warning: {
      50: 'var(--color-warning-50)',
      100: 'var(--color-warning-100)',
      200: 'var(--color-warning-200)',
      300: 'var(--color-warning-300)',
      400: 'var(--color-warning-400)',
      500: 'var(--color-warning-500)',
      600: 'var(--color-warning-600)',
      700: 'var(--color-warning-700)',
      800: 'var(--color-warning-800)',
      900: 'var(--color-warning-900)',
    },
    danger: {
      50: 'var(--color-danger-50)',
      100: 'var(--color-danger-100)',
      200: 'var(--color-danger-200)',
      300: 'var(--color-danger-300)',
      400: 'var(--color-danger-400)',
      500: 'var(--color-danger-500)',
      600: 'var(--color-danger-600)',
      700: 'var(--color-danger-700)',
      800: 'var(--color-danger-800)',
      900: 'var(--color-danger-900)',
    },
    info: {
      50: 'var(--color-info-50)',
      100: 'var(--color-info-100)',
      200: 'var(--color-info-200)',
      300: 'var(--color-info-300)',
      400: 'var(--color-info-400)',
      500: 'var(--color-info-500)',
      600: 'var(--color-info-600)',
      700: 'var(--color-info-700)',
      800: 'var(--color-info-800)',
      900: 'var(--color-info-900)',
    },
    gray: {
      50: 'var(--color-gray-50)',
      100: 'var(--color-gray-100)',
      200: 'var(--color-gray-200)',
      300: 'var(--color-gray-300)',
      400: 'var(--color-gray-400)',
      500: 'var(--color-gray-500)',
      600: 'var(--color-gray-600)',
      700: 'var(--color-gray-700)',
      800: 'var(--color-gray-800)',
      900: 'var(--color-gray-900)',
    },
    white: 'var(--color-white)',
    black: 'var(--color-black)',
    status: {
      pending: 'var(--color-status-pending)',
      inProgress: 'var(--color-status-inprogress)',
      completed: 'var(--color-status-completed)',
      stopped: 'var(--color-status-stopped)',
    },
    priority: {
      high: 'var(--color-priority-high)',
      medium: 'var(--color-priority-medium)',
      low: 'var(--color-priority-low)',
    },
    factory: {
      fragrance: 'var(--color-factory-fragrance)',
      material: 'var(--color-factory-material)',
      manufacturing: 'var(--color-factory-manufacturing)',
      container: 'var(--color-factory-container)',
      packaging: 'var(--color-factory-packaging)',
      default: 'var(--color-factory-default)',
    },
  },
  shadows: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)',
    inner: 'var(--shadow-inner)',
  },
  radius: {
    none: 'var(--radius-none)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    '3xl': 'var(--radius-3xl)',
    full: 'var(--radius-full)',
  },
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
    '2xl': 'var(--spacing-2xl)',
  },
  transitions: {
    fast: 'var(--transition-fast)',
    base: 'var(--transition-base)',
    slow: 'var(--transition-slow)',
    slower: 'var(--transition-slower)',
  },
  zIndex: {
    0: 'var(--z-0)',
    10: 'var(--z-10)',
    20: 'var(--z-20)',
    30: 'var(--z-30)',
    40: 'var(--z-40)',
    50: 'var(--z-50)',
    60: 'var(--z-60)',
    70: 'var(--z-70)',
    80: 'var(--z-80)',
    90: 'var(--z-90)',
    100: 'var(--z-100)',
    modal: 'var(--z-modal)',
    tooltip: 'var(--z-tooltip)',
    notification: 'var(--z-notification)',
  },
  layout: {
    headerHeight: 'var(--layout-header-height)',
    sidebarWidth: 'var(--layout-sidebar-width)',
    sidebarCollapsed: 'var(--layout-sidebar-collapsed)',
    containerMax: 'var(--layout-container-max)',
    contentMax: 'var(--layout-content-max)',
    floatingButton: {
      bottom: 'var(--layout-floating-button-bottom)',
      right: 'var(--layout-floating-button-right)',
      gap: 'var(--layout-floating-button-gap)',
    },
  },
} as const;

// Factory color palette for dynamic use
export const factoryColors = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#84CC16", // Lime
  "#F97316", // Orange
  "#06B6D4"  // Cyan
] as const;

// Status color mappings
export const statusColors = {
  [PROJECT_STATUS.BEFORE_START]: theme.colors.status.pending,
  [PROJECT_STATUS.IN_PROGRESS]: theme.colors.status.inProgress,
  [PROJECT_STATUS.COMPLETED]: theme.colors.status.completed,
  [PROJECT_STATUS.SUSPENDED]: theme.colors.status.stopped,
} as const;

// Priority color mappings
export const priorityColors = {
  [PROJECT_PRIORITY['high']]: theme.colors.priority.high,
  [PROJECT_PRIORITY['medium']]: theme.colors.priority.medium,
  [PROJECT_PRIORITY['low']]: theme.colors.priority.low,
} as const;

// Helper function to get CSS variable value
export function getCSSVariable(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable);
}

// Helper function to set CSS variable value
export function setCSSVariable(variable: string, value: string): void {
  document.documentElement.style.setProperty(variable, value);
}