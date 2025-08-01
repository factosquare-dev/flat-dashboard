/**
 * Form Compound Components
 * 
 * A flexible form system using the compound components pattern
 * Provides better composition and validation capabilities
 */

import React, { createContext, useContext, useRef, FormEvent } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import './Form.css';

// Form Context for sharing state and validation
interface FormContextValue {
  formId: string;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  registerField: (name: string) => void;
  setFieldError: (name: string, error: string) => void;
  setFieldTouched: (name: string) => void;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form compound components must be used within Form.Root');
  }
  return context;
};

// Field Context for individual fields
interface FieldContextValue {
  name: string;
  error?: string;
  touched: boolean;
}

const FieldContext = createContext<FieldContextValue | undefined>(undefined);

const useFieldContext = () => {
  const context = useContext(FieldContext);
  if (!context) {
    throw new Error('Field components must be used within Form.Field');
  }
  return context;
};

// Root Form Component
interface FormRootProps {
  children: React.ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  className?: string;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  isSubmitting?: boolean;
}

const FormRoot: React.FC<FormRootProps> = ({ 
  children, 
  onSubmit,
  className,
  errors = {},
  touched = {},
  isSubmitting = false
}) => {
  const formId = useRef(`form-${Math.random().toString(36).substr(2, 9)}`).current;
  const fields = useRef<Set<string>>(new Set());

  const registerField = (name: string) => {
    fields.current.add(name);
  };

  const setFieldError = (name: string, error: string) => {
    // This would typically be handled by the parent component
    console.warn('setFieldError should be implemented by parent component');
  };

  const setFieldTouched = (name: string) => {
    // This would typically be handled by the parent component
    console.warn('setFieldTouched should be implemented by parent component');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <FormContext.Provider value={{
      formId,
      errors,
      touched,
      registerField,
      setFieldError,
      setFieldTouched,
      isSubmitting
    }}>
      <form 
        id={formId}
        onSubmit={handleSubmit}
        className={cn('form', className)}
        noValidate
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

// Form Field Component (wrapper for field group)
interface FormFieldProps {
  name: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  name, 
  children, 
  className 
}) => {
  const { errors, touched, registerField } = useFormContext();
  
  React.useEffect(() => {
    registerField(name);
  }, [name, registerField]);

  const error = errors[name];
  const isTouched = touched[name];

  return (
    <FieldContext.Provider value={{ name, error, touched: isTouched }}>
      <div className={cn('form-field', error && 'form-field--error', className)}>
        {children}
      </div>
    </FieldContext.Provider>
  );
};

// Form Label Component
interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

const FormLabel: React.FC<FormLabelProps> = ({ 
  children, 
  required = false,
  className 
}) => {
  const { name } = useFieldContext();
  
  return (
    <label 
      htmlFor={name}
      className={cn('form-label', className)}
    >
      {children}
      {required && <span className="form-label__required">*</span>}
    </label>
  );
};

// Form Input Component
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  className,
  ...props 
}) => {
  const { name, error } = useFieldContext();
  const { setFieldTouched } = useFormContext();
  
  return (
    <input
      id={name}
      name={name}
      className={cn(
        'form-input',
        error && 'form-input--error',
        className
      )}
      onBlur={() => setFieldTouched(name)}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      {...props}
    />
  );
};

// Form Select Component
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({ 
  className,
  children,
  ...props 
}) => {
  const { name, error } = useFieldContext();
  const { setFieldTouched } = useFormContext();
  
  return (
    <select
      id={name}
      name={name}
      className={cn(
        'form-select',
        error && 'form-select--error',
        className
      )}
      onBlur={() => setFieldTouched(name)}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      {...props}
    >
      {children}
    </select>
  );
};

// Form Textarea Component
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const FormTextarea: React.FC<FormTextareaProps> = ({ 
  className,
  ...props 
}) => {
  const { name, error } = useFieldContext();
  const { setFieldTouched } = useFormContext();
  
  return (
    <textarea
      id={name}
      name={name}
      className={cn(
        'form-textarea',
        error && 'form-textarea--error',
        className
      )}
      onBlur={() => setFieldTouched(name)}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      {...props}
    />
  );
};

// Form Error Component
interface FormErrorProps {
  className?: string;
}

const FormError: React.FC<FormErrorProps> = ({ className }) => {
  const { name, error } = useFieldContext();
  
  if (!error) return null;
  
  return (
    <div 
      id={`${name}-error`}
      className={cn('form-error', className)}
      role="alert"
    >
      <AlertCircle className="form-error__icon" />
      <span className="form-error__message">{error}</span>
    </div>
  );
};

// Form Helper Text Component
interface FormHelperProps {
  children: React.ReactNode;
  className?: string;
}

const FormHelper: React.FC<FormHelperProps> = ({ 
  children, 
  className 
}) => {
  const { name } = useFieldContext();
  
  return (
    <div 
      id={`${name}-helper`}
      className={cn('form-helper', className)}
    >
      {children}
    </div>
  );
};

// Form Section Component (for grouping fields)
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title,
  description,
  children, 
  className 
}) => {
  return (
    <div className={cn('form-section', className)}>
      {title && <h3 className="form-section__title">{title}</h3>}
      {description && <p className="form-section__description">{description}</p>}
      <div className="form-section__fields">
        {children}
      </div>
    </div>
  );
};

// Form Actions Component (for submit/cancel buttons)
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

const FormActions: React.FC<FormActionsProps> = ({ 
  children, 
  className,
  align = 'right'
}) => {
  return (
    <div className={cn('form-actions', `form-actions--${align}`, className)}>
      {children}
    </div>
  );
};

// Export compound components
export const Form = {
  Root: FormRoot,
  Field: FormField,
  Label: FormLabel,
  Input: FormInput,
  Select: FormSelect,
  Textarea: FormTextarea,
  Error: FormError,
  Helper: FormHelper,
  Section: FormSection,
  Actions: FormActions,
};

// Usage Example:
// <Form.Root onSubmit={handleSubmit} errors={errors} touched={touched}>
//   <Form.Section title="Basic Information">
//     <Form.Field name="name">
//       <Form.Label required>Project Name</Form.Label>
//       <Form.Input type="text" placeholder="Enter project name" />
//       <Form.Error />
//     </Form.Field>
//     
//     <Form.Field name="description">
//       <Form.Label>Description</Form.Label>
//       <Form.Textarea rows={4} placeholder="Enter description" />
//       <Form.Helper>Provide a brief description of the project</Form.Helper>
//       <Form.Error />
//     </Form.Field>
//   </Form.Section>
//   
//   <Form.Actions>
//     <Button variant="secondary" onClick={onCancel}>Cancel</Button>
//     <Button variant="primary" type="submit">Save</Button>
//   </Form.Actions>
// </Form.Root>