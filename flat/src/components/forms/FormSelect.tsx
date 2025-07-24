import React from 'react';
import { cn } from '../../utils/cn';

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
  containerClassName?: string;
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(({
  label,
  error,
  helperText,
  options = [],
  className = '',
  containerClassName = '',
  required,
  children,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          "w-full px-3 py-2 border rounded-lg text-sm",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          error 
            ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      >
        {children || options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

FormSelect.displayName = 'FormSelect';

export default FormSelect;