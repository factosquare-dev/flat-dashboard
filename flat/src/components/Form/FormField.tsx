/**
 * Reusable form field components
 */

import React, { useId, useMemo } from 'react';

interface BaseFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
}

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  resize?: boolean;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
}

interface RadioGroupFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  inline?: boolean;
}

// Base field wrapper component
const FieldWrapper = React.memo<{
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  fieldId: string;
  children: React.ReactNode;
}>(({ label, error, required, helperText, fieldId, children }) => {
  const wrapperClassName = useMemo(() => 'space-y-1', []);
  
  const labelClassName = useMemo(() => 
    'block text-sm font-medium text-gray-700',
    []
  );
  
  const errorClassName = useMemo(() => 
    'text-sm text-red-600',
    []
  );
  
  const helperClassName = useMemo(() => 
    'text-sm text-gray-500',
    []
  );

  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={fieldId} className={labelClassName}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className={errorClassName}>{error}</p>}
      {helperText && !error && <p className={helperClassName}>{helperText}</p>}
    </div>
  );
});

FieldWrapper.displayName = 'FieldWrapper';

// Input field component
export const InputField = React.memo<InputFieldProps>(({
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  maxLength,
  pattern,
  disabled = false,
  className = '',
  ...wrapperProps
}) => {
  const id = useId();
  
  const inputClassName = useMemo(() => {
    const baseClasses = [
      'block', 'w-full', 'rounded-md', 'border-gray-300', 
      'shadow-sm', 'focus:border-indigo-500', 'focus:ring-indigo-500', 'sm:text-sm'
    ];
    
    if (wrapperProps.error) {
      baseClasses.push('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
    }
    
    if (disabled) {
      baseClasses.push('bg-gray-50', 'text-gray-500', 'cursor-not-allowed');
    }
    
    return [...baseClasses, className].join(' ');
  }, [wrapperProps.error, disabled, className]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  }, [onChange]);

  return (
    <FieldWrapper {...wrapperProps} fieldId={id}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        pattern={pattern}
        disabled={disabled}
        className={inputClassName}
      />
    </FieldWrapper>
  );
});

InputField.displayName = 'InputField';

// TextArea field component
export const TextAreaField = React.memo<TextAreaFieldProps>(({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  resize = true,
  disabled = false,
  className = '',
  ...wrapperProps
}) => {
  const id = useId();
  
  const textAreaClassName = useMemo(() => {
    const baseClasses = [
      'block', 'w-full', 'rounded-md', 'border-gray-300', 
      'shadow-sm', 'focus:border-indigo-500', 'focus:ring-indigo-500', 'sm:text-sm'
    ];
    
    if (wrapperProps.error) {
      baseClasses.push('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
    }
    
    if (disabled) {
      baseClasses.push('bg-gray-50', 'text-gray-500', 'cursor-not-allowed');
    }
    
    if (!resize) {
      baseClasses.push('resize-none');
    }
    
    return [...baseClasses, className].join(' ');
  }, [wrapperProps.error, disabled, resize, className]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  }, [onChange]);

  return (
    <FieldWrapper {...wrapperProps} fieldId={id}>
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={textAreaClassName}
      />
    </FieldWrapper>
  );
});

TextAreaField.displayName = 'TextAreaField';

// Select field component
export const SelectField = React.memo<SelectFieldProps>(({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = '',
  ...wrapperProps
}) => {
  const id = useId();
  
  const selectClassName = useMemo(() => {
    const baseClasses = [
      'block', 'w-full', 'rounded-md', 'border-gray-300', 
      'shadow-sm', 'focus:border-indigo-500', 'focus:ring-indigo-500', 'sm:text-sm'
    ];
    
    if (wrapperProps.error) {
      baseClasses.push('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
    }
    
    if (disabled) {
      baseClasses.push('bg-gray-50', 'text-gray-500', 'cursor-not-allowed');
    }
    
    return [...baseClasses, className].join(' ');
  }, [wrapperProps.error, disabled, className]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  }, [onChange]);

  return (
    <FieldWrapper {...wrapperProps} fieldId={id}>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={selectClassName}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
});

SelectField.displayName = 'SelectField';

// Checkbox field component
export const CheckboxField = React.memo<CheckboxFieldProps>(({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  className = '',
  ...wrapperProps
}) => {
  const id = useId();
  const checkboxRef = React.useRef<HTMLInputElement>(null);
  
  const checkboxClassName = useMemo(() => {
    const baseClasses = [
      'h-4', 'w-4', 'text-indigo-600', 'border-gray-300', 
      'rounded', 'focus:ring-indigo-500'
    ];
    
    if (disabled) {
      baseClasses.push('bg-gray-50', 'cursor-not-allowed');
    }
    
    return [...baseClasses, className].join(' ');
  }, [disabled, className]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  }, [onChange]);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <FieldWrapper {...wrapperProps} fieldId={id}>
      <div className="flex items-center">
        <input
          ref={checkboxRef}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={checkboxClassName}
        />
        {wrapperProps.label && (
          <label htmlFor={id} className="ml-2 text-sm text-gray-700">
            {wrapperProps.label}
            {wrapperProps.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
    </FieldWrapper>
  );
});

CheckboxField.displayName = 'CheckboxField';

// Radio group field component
export const RadioGroupField = React.memo<RadioGroupFieldProps>(({
  value,
  onChange,
  options,
  inline = false,
  disabled = false,
  className = '',
  ...wrapperProps
}) => {
  const groupName = useId();
  
  const containerClassName = useMemo(() => {
    return inline ? 'flex space-x-4' : 'space-y-2';
  }, [inline]);

  const radioClassName = useMemo(() => {
    const baseClasses = [
      'h-4', 'w-4', 'text-indigo-600', 'border-gray-300', 
      'focus:ring-indigo-500'
    ];
    
    if (disabled) {
      baseClasses.push('bg-gray-50', 'cursor-not-allowed');
    }
    
    return [...baseClasses, className].join(' ');
  }, [disabled, className]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  }, [onChange]);

  return (
    <FieldWrapper {...wrapperProps} fieldId={groupName}>
      <div className={containerClassName}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${groupName}-${option.value}`}
              name={groupName}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              disabled={disabled || option.disabled}
              className={radioClassName}
            />
            <label
              htmlFor={`${groupName}-${option.value}`}
              className="ml-2 text-sm text-gray-700"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </FieldWrapper>
  );
});

RadioGroupField.displayName = 'RadioGroupField';