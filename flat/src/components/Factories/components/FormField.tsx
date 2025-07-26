import React from 'react';
import { AlertCircle } from 'lucide-react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  name?: string;
  id?: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'select';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  children?: React.ReactNode; // For select options
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  disabled,
  error,
  hint,
  children
}) => {
  const fieldId = id || name;
  const hasError = !!error;
  
  const fieldClassName = `form-field ${hasError ? 'form-field--error' : ''}`;
  
  return (
    <div className={fieldClassName}>
      <label 
        htmlFor={fieldId}
        className={`form-field__label ${required ? 'form-field__label--required' : ''}`}
      >
        {label}
      </label>
      
      {type === 'select' ? (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className="form-field__select"
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
        >
          {children}
        </select>
      ) : (
        <input
          id={fieldId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="form-field__input"
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
        />
      )}
      
      {error && (
        <div id={`${fieldId}-error`} className="form-field__error" role="alert">
          <AlertCircle className="form-field__error-icon" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <div className="form-field__hint">{hint}</div>
      )}
    </div>
  );
};

export default FormField;