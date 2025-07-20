import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'flex w-full rounded-md border bg-white ring-offset-white file:border-0 file:bg-transparent file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:ring-indigo-500',
        error: 'border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus-visible:ring-green-500',
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm file:text-sm',
        md: 'h-11 px-4 text-base file:text-base',
        lg: 'h-14 px-5 text-lg file:text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize, 
    type, 
    leftIcon,
    rightIcon,
    error,
    label,
    helperText,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const inputVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-base font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none [&>svg]:w-5 [&>svg]:h-5">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={inputVariants({ 
              variant: inputVariant, 
              inputSize, 
              className: `${leftIcon ? 'pl-12' : ''} ${rightIcon ? 'pr-12' : ''} ${className}` 
            })}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none [&>svg]:w-5 [&>svg]:h-5">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };