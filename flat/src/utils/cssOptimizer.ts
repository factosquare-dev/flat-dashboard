/**
 * CSS optimization utilities
 */

import { useMemo } from 'react';

// Common Tailwind CSS patterns consolidated into single classes
export const CSS_PATTERNS = {
  // Layout patterns
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
  flexColCenter: 'flex flex-col items-center justify-center',
  absoluteCenter: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  
  // Card patterns
  card: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
  cardHover: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-shadow hover:shadow-md',
  cardCompact: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4',
  
  // Button patterns
  btnPrimary: 'bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors',
  btnSecondary: 'bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors',
  btnDanger: 'bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors',
  btnGhost: 'text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors',
  
  // Input patterns
  input: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
  inputError: 'block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm',
  
  // Status patterns
  statusSuccess: 'bg-green-100 text-green-800 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-medium',
  statusWarning: 'bg-yellow-100 text-yellow-800 border border-yellow-200 px-2.5 py-0.5 rounded-full text-xs font-medium',
  statusError: 'bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-medium',
  statusInfo: 'bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-medium',
  
  // Table patterns
  tableHeader: 'bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  tableRowHover: 'hover:bg-gray-50 cursor-pointer',
  
  // Modal patterns
  modalOverlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
  modalContent: 'bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6',
  
  // Loading patterns
  spinner: 'inline-block w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin',
  skeleton: 'bg-gray-200 animate-pulse rounded',
  
  // Animation patterns
  fadeIn: 'opacity-0 animate-fade-in',
  slideUp: 'translate-y-2 opacity-0 animate-slide-up',
} as const;

/**
 * Merge CSS classes efficiently
 */
export function mergeClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Conditional CSS classes utility
 */
export function conditionalClasses(
  baseClasses: string,
  conditionalClasses: Record<string, boolean | undefined>
): string {
  const conditionalList = Object.entries(conditionalClasses)
    .filter(([, condition]) => condition)
    .map(([className]) => className);
  
  return mergeClasses(baseClasses, ...conditionalList);
}

/**
 * Hook for optimized CSS class generation
 */
export function useOptimizedClasses<T extends Record<string, any>>(
  classMap: T,
  dependencies: any[] = []
): T {
  return useMemo(() => {
    const optimized = {} as T;
    
    for (const [key, value] of Object.entries(classMap)) {
      if (typeof value === 'string') {
        // Replace common patterns with optimized versions
        let optimizedValue = value;
        
        for (const [pattern, replacement] of Object.entries(CSS_PATTERNS)) {
          optimizedValue = optimizedValue.replace(
            new RegExp(replacement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            pattern
          );
        }
        
        optimized[key as keyof T] = optimizedValue as T[keyof T];
      } else {
        optimized[key as keyof T] = value;
      }
    }
    
    return optimized;
  }, dependencies);
}

/**
 * Generate responsive classes
 */
export function responsiveClasses(
  mobile: string,
  tablet?: string,
  desktop?: string,
  wide?: string
): string {
  const classes = [mobile];
  
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  if (wide) classes.push(`xl:${wide}`);
  
  return classes.join(' ');
}

/**
 * Generate state-based classes (hover, focus, active, etc.)
 */
export function stateClasses(
  base: string,
  states: {
    hover?: string;
    focus?: string;
    active?: string;
    disabled?: string;
  } = {}
): string {
  const classes = [base];
  
  if (states.hover) classes.push(`hover:${states.hover}`);
  if (states.focus) classes.push(`focus:${states.focus}`);
  if (states.active) classes.push(`active:${states.active}`);
  if (states.disabled) classes.push(`disabled:${states.disabled}`);
  
  return classes.join(' ');
}

/**
 * Generate size variant classes
 */
export function sizeVariant(
  base: string,
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  sizeMap: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }
): string {
  return mergeClasses(base, sizeMap[size]);
}

/**
 * Generate color variant classes
 */
export function colorVariant(
  base: string,
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray' = 'primary',
  colorMap: Record<string, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    gray: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  }
): string {
  return mergeClasses(base, colorMap[color]);
}

/**
 * CSS custom properties helper for dynamic values
 */
export function cssVariables(variables: Record<string, string | number>): React.CSSProperties {
  const style: React.CSSProperties = {};
  
  for (const [key, value] of Object.entries(variables)) {
    const cssVar = key.startsWith('--') ? key : `--${key}`;
    (style as any)[cssVar] = typeof value === 'number' ? `${value}px` : value;
  }
  
  return style;
}

/**
 * Create CSS grid template
 */
export function gridTemplate(
  columns: number | string[],
  gap: string = '1rem'
): React.CSSProperties {
  const gridTemplateColumns = Array.isArray(columns)
    ? columns.join(' ')
    : `repeat(${columns}, 1fr)`;
    
  return {
    display: 'grid',
    gridTemplateColumns,
    gap,
  };
}

/**
 * Performance-optimized class name builder
 */
export class ClassNameBuilder {
  private classes: string[] = [];
  
  add(className: string | undefined | null | false): this {
    if (className) {
      this.classes.push(className);
    }
    return this;
  }
  
  addIf(condition: boolean, className: string): this {
    if (condition) {
      this.classes.push(className);
    }
    return this;
  }
  
  addPattern(pattern: keyof typeof CSS_PATTERNS): this {
    this.classes.push(CSS_PATTERNS[pattern]);
    return this;
  }
  
  merge(other: ClassNameBuilder): this {
    this.classes.push(...other.classes);
    return this;
  }
  
  build(): string {
    return this.classes.join(' ');
  }
  
  static create(): ClassNameBuilder {
    return new ClassNameBuilder();
  }
}