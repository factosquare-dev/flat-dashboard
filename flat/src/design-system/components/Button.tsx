import React from 'react';
import { cn } from '../../utils/cn';
import { sizes, colors, borderRadius, transitions } from '../tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const buttonVariants = {
  primary: `
    bg-primary-600 text-white 
    hover:bg-primary-700 
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:bg-primary-300 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-white text-gray-700 border border-gray-300
    hover:bg-gray-50 hover:border-gray-400
    focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed
  `,
  danger: `
    bg-error-600 text-white
    hover:bg-error-700
    focus:ring-2 focus:ring-error-500 focus:ring-offset-2
    disabled:bg-error-300 disabled:cursor-not-allowed
  `,
  ghost: `
    text-gray-700
    hover:bg-gray-100
    focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    disabled:text-gray-400 disabled:cursor-not-allowed
  `,
  link: `
    text-primary-600 underline-offset-4
    hover:text-primary-700 hover:underline
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:text-gray-400 disabled:cursor-not-allowed
  `,
};

const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    children,
    ...props 
  }, ref) => {
    const LoadingSpinner = () => (
      <svg 
        className="animate-spin h-4 w-4" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-medium rounded-md',
          'transition-all duration-200',
          'focus:outline-none',
          buttonVariants[variant],
          buttonSizes[size],
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && iconPosition === 'left' && <LoadingSpinner />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
        {loading && iconPosition === 'right' && <LoadingSpinner />}
      </button>
    );
  }
);

Button.displayName = 'Button';