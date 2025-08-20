/**
 * Common style utilities for consistent styling across the application
 */

import { cn } from './classNames';

// Button styles
export const buttonStyles = {
  base: 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  variants: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  },
  
  sizes: {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-lg',
  },
  
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
};

export const getButtonClasses = (
  variant: keyof typeof buttonStyles.variants = 'primary',
  size: keyof typeof buttonStyles.sizes = 'md',
  disabled?: boolean,
  className?: string
) => {
  return cn(
    buttonStyles.base,
    buttonStyles.variants[variant],
    buttonStyles.sizes[size],
    disabled && buttonStyles.disabled,
    className
  );
};

// Input styles
export const inputStyles = {
  base: 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors',
  
  variants: {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
  },
  
  sizes: {
    sm: 'text-sm py-1.5',
    md: 'text-base py-2',
    lg: 'text-lg py-3',
  },
  
  disabled: 'bg-gray-100 cursor-not-allowed',
};

export const getInputClasses = (
  variant: keyof typeof inputStyles.variants = 'default',
  size: keyof typeof inputStyles.sizes = 'md',
  disabled?: boolean,
  className?: string
) => {
  return cn(
    inputStyles.base,
    inputStyles.variants[variant],
    inputStyles.sizes[size],
    disabled && inputStyles.disabled,
    className
  );
};

// Card styles
export const cardStyles = {
  base: 'bg-white rounded-lg border border-gray-200',
  
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
  
  shadow: {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  },
  
  hover: 'hover:shadow-lg transition-shadow duration-300',
};

export const getCardClasses = (
  padding: keyof typeof cardStyles.padding = 'md',
  shadow: keyof typeof cardStyles.shadow = 'none',
  hoverable?: boolean,
  className?: string
) => {
  return cn(
    cardStyles.base,
    cardStyles.padding[padding],
    cardStyles.shadow[shadow],
    hoverable && cardStyles.hover,
    className
  );
};

// Badge styles
export const badgeStyles = {
  base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  
  variants: {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
  },
};

export const getBadgeClasses = (
  variant: keyof typeof badgeStyles.variants = 'default',
  className?: string
) => {
  return cn(
    badgeStyles.base,
    badgeStyles.variants[variant],
    className
  );
};

// Common layout utilities
export const layoutStyles = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12',
  grid: {
    cols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
  },
};

// Animation utilities
export const animationStyles = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideInRight: 'animate-in slide-in-from-right duration-300',
  slideInLeft: 'animate-in slide-in-from-left duration-300',
  slideInTop: 'animate-in slide-in-from-top duration-300',
  slideInBottom: 'animate-in slide-in-from-bottom duration-300',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
};

// Scrollbar styles
export const scrollbarStyles = {
  thin: `
    scrollbar-thin 
    scrollbar-thumb-gray-400 
    scrollbar-track-gray-100 
    hover:scrollbar-thumb-gray-500
  `,
  custom: `
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-gray-100
    [&::-webkit-scrollbar-thumb]:bg-gray-400
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb:hover]:bg-gray-500
  `,
};