import React, { useCallback } from 'react';
import { cn } from '../../utils/cn';
import { generateAriaId } from '../../utils/accessibility';
import './FormInput.css';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  onEnterPress?: () => void;
}

const FormInput: React.FC<FormInputProps> = React.memo(({
  label,
  error,
  icon,
  helperText,
  onEnterPress,
  className = '',
  onKeyPress,
  required,
  id,
  ...props
}) => {
  const inputId = id || generateAriaId('input');
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helperText ? `${inputId}-help` : undefined;
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
    onKeyPress?.(e);
  }, [onEnterPress, onKeyPress]);
  return (
    <div className="form-input">
      {label && (
        <label 
          htmlFor={inputId}
          className={cn(
            'form-input__label',
            required && 'form-input__label--required'
          )}
        >
          {label}
        </label>
      )}
      <div className="form-input__wrapper">
        {icon && (
          <div className="form-input__icon" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'form-input__field',
            error && 'form-input__field--error',
            icon && 'form-input__field--with-icon',
            className
          )}
          onKeyPress={handleKeyPress}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={cn(errorId, helpId).trim() || undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="form-input__error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helpId} className="form-input__helper">
          {helperText}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;