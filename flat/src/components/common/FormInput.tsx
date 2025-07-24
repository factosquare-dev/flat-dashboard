import React, { useCallback } from 'react';
import { COMPONENT_STYLES, cn } from '../../styles/components';
import { ARIA_LABELS, generateAriaId } from '../../utils/accessibility';

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
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className={cn(
            COMPONENT_STYLES.LABEL.BASE,
            required && COMPONENT_STYLES.LABEL.REQUIRED
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            COMPONENT_STYLES.INPUT.BASE,
            error ? COMPONENT_STYLES.INPUT.STATE.ERROR : COMPONENT_STYLES.INPUT.STATE.DEFAULT,
            icon ? 'pl-10' : '',
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
        <p id={errorId} className={COMPONENT_STYLES.TEXT.ERROR} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helpId} className={COMPONENT_STYLES.TEXT.HELPER}>
          {helperText}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;