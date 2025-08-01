import React from 'react';
import { cn } from '@/utils/cn';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  onEnterPress?: () => void;
  containerClassName?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  error,
  icon,
  helperText,
  onEnterPress,
  className = '',
  containerClassName = '',
  onKeyPress,
  required,
  ...props
}, ref) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
    onKeyPress?.(e);
  };

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-lg text-sm",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            icon && "pl-10",
            error 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
            className
          )}
          onKeyPress={handleKeyPress}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${props.id}-helper`} className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;