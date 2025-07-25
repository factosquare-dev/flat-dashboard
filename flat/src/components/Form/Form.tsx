/**
 * Main Form component with optimized rendering
 */

import React, { useMemo } from 'react';

interface FormProps {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  noValidate?: boolean;
  autoComplete?: 'on' | 'off';
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

// Main form component
const Form = React.memo<FormProps>(({
  children,
  onSubmit,
  className = '',
  noValidate = true,
  autoComplete = 'off',
}) => {
  const formClassName = useMemo(() => {
    return `space-y-6 ${className}`;
  }, [className]);

  return (
    <form
      onSubmit={onSubmit}
      className={formClassName}
      noValidate={noValidate}
      autoComplete={autoComplete}
    >
      {children}
    </form>
  );
});

Form.displayName = 'Form';

// Form section component for grouping related fields
const FormSection = React.memo<FormSectionProps>(({
  title,
  description,
  children,
  className = '',
}) => {
  const sectionClassName = useMemo(() => {
    return `space-y-4 ${className}`;
  }, [className]);

  return (
    <div className={sectionClassName}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
});

FormSection.displayName = 'FormSection';

// Form actions component for buttons
const FormActions = React.memo<FormActionsProps>(({
  children,
  align = 'right',
  className = '',
}) => {
  const actionsClassName = useMemo(() => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };
    
    return `flex space-x-3 ${alignClasses[align]} ${className}`;
  }, [align, className]);

  return (
    <div className={actionsClassName}>
      {children}
    </div>
  );
});

FormActions.displayName = 'FormActions';

// Form grid layout component
interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

const FormGrid = React.memo<FormGridProps>(({
  children,
  columns = 2,
  gap = 'medium',
  className = '',
}) => {
  const gridClassName = useMemo(() => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };
    
    const gapClasses = {
      small: 'gap-3',
      medium: 'gap-4',
      large: 'gap-6',
    };
    
    return `grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`;
  }, [columns, gap, className]);

  return (
    <div className={gridClassName}>
      {children}
    </div>
  );
});

FormGrid.displayName = 'FormGrid';

// Form field group component
interface FormFieldGroupProps {
  children: React.ReactNode;
  inline?: boolean;
  className?: string;
}

const FormFieldGroup = React.memo<FormFieldGroupProps>(({
  children,
  inline = false,
  className = '',
}) => {
  const groupClassName = useMemo(() => {
    const layoutClass = inline ? 'flex space-x-4 items-end' : 'space-y-4';
    return `${layoutClass} ${className}`;
  }, [inline, className]);

  return (
    <div className={groupClassName}>
      {children}
    </div>
  );
});

FormFieldGroup.displayName = 'FormFieldGroup';

// Export all form components
export default Form;
export { FormSection, FormActions, FormGrid, FormFieldGroup };

// Form button components
interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export const FormButton = React.memo<FormButtonProps>(({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const buttonClassName = useMemo(() => {
    const baseClasses = [
      'inline-flex', 'items-center', 'justify-center', 'border', 
      'rounded-md', 'font-medium', 'focus:outline-none', 'focus:ring-2', 
      'focus:ring-offset-2', 'transition-colors', 'duration-200'
    ];
    
    // Variant styles
    const variantClasses = {
      primary: [
        'border-transparent', 'bg-indigo-600', 'text-white', 
        'hover:bg-indigo-700', 'focus:ring-indigo-500'
      ],
      secondary: [
        'border-gray-300', 'bg-white', 'text-gray-700', 
        'hover:bg-gray-50', 'focus:ring-indigo-500'
      ],
      danger: [
        'border-transparent', 'bg-red-600', 'text-white', 
        'hover:bg-red-700', 'focus:ring-red-500'
      ],
      ghost: [
        'border-transparent', 'bg-transparent', 'text-gray-700', 
        'hover:bg-gray-100', 'focus:ring-indigo-500'
      ],
    };
    
    // Size styles
    const sizeClasses = {
      small: ['px-3', 'py-2', 'text-sm', 'leading-4'],
      medium: ['px-4', 'py-2', 'text-sm'],
      large: ['px-6', 'py-3', 'text-base'],
    };
    
    // Disabled styles
    if (disabled || loading) {
      baseClasses.push('opacity-50', 'cursor-not-allowed');
    }
    
    return [
      ...baseClasses,
      ...variantClasses[variant],
      ...sizeClasses[size],
      className
    ].join(' ');
  }, [variant, size, disabled, loading, className]);

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={buttonClassName}
    >
      {loading && (
        <svg
          className="w-4 h-4 mr-2 animate-spin"
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
      )}
      {children}
    </button>
  );
});

FormButton.displayName = 'FormButton';