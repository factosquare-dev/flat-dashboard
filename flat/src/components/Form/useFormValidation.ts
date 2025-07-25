/**
 * Enhanced form validation hook with memoization
 */

import { useState, useCallback, useMemo } from 'react';

type ValidationRule<T = any> = {
  required?: boolean | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: RegExp | string;
  min?: number | string;
  max?: number | string;
  email?: boolean | string;
  url?: boolean | string;
  custom?: (value: T) => boolean | string;
};

type FormSchema<T extends Record<string, any>> = {
  [K in keyof T]: ValidationRule<T[K]>;
};

type FormErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string;
};

type TouchedFields<T extends Record<string, any>> = {
  [K in keyof T]?: boolean;
};

interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  schema: FormSchema<T>,
  options: UseFormValidationOptions = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized validation function for a single field
  const validateField = useCallback(
    (fieldName: keyof T, value: any): string | undefined => {
      const rule = schema[fieldName];
      if (!rule) return undefined;

      // Required validation
      if (rule.required) {
        const isEmpty = value === '' || value === null || value === undefined ||
          (Array.isArray(value) && value.length === 0);
        
        if (isEmpty) {
          return typeof rule.required === 'string' 
            ? rule.required 
            : `${String(fieldName)} is required`;
        }
      }

      // Skip other validations if value is empty and not required
      if (!value && !rule.required) return undefined;

      // String length validations
      if (typeof value === 'string') {
        if (rule.minLength) {
          const minLength = typeof rule.minLength === 'number' ? rule.minLength : parseInt(rule.minLength);
          if (value.length < minLength) {
            return typeof rule.minLength === 'string' && rule.minLength.includes('%')
              ? rule.minLength.replace('%d', minLength.toString())
              : `${String(fieldName)} must be at least ${minLength} characters`;
          }
        }

        if (rule.maxLength) {
          const maxLength = typeof rule.maxLength === 'number' ? rule.maxLength : parseInt(rule.maxLength);
          if (value.length > maxLength) {
            return typeof rule.maxLength === 'string' && rule.maxLength.includes('%')
              ? rule.maxLength.replace('%d', maxLength.toString())
              : `${String(fieldName)} must be no more than ${maxLength} characters`;
          }
        }

        // Pattern validation
        if (rule.pattern) {
          const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
          if (!pattern.test(value)) {
            return typeof rule.pattern === 'string' && rule.pattern.includes('message:')
              ? rule.pattern.split('message:')[1]
              : `${String(fieldName)} format is invalid`;
          }
        }

        // Email validation
        if (rule.email) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            return typeof rule.email === 'string' 
              ? rule.email 
              : `${String(fieldName)} must be a valid email`;
          }
        }

        // URL validation
        if (rule.url) {
          try {
            new URL(value);
          } catch {
            return typeof rule.url === 'string' 
              ? rule.url 
              : `${String(fieldName)} must be a valid URL`;
          }
        }
      }

      // Numeric validations
      if (typeof value === 'number' || !isNaN(Number(value))) {
        const numValue = typeof value === 'number' ? value : Number(value);
        
        if (rule.min !== undefined) {
          const minValue = typeof rule.min === 'number' ? rule.min : Number(rule.min);
          if (numValue < minValue) {
            return typeof rule.min === 'string' && rule.min.includes('%')
              ? rule.min.replace('%d', minValue.toString())
              : `${String(fieldName)} must be at least ${minValue}`;
          }
        }

        if (rule.max !== undefined) {
          const maxValue = typeof rule.max === 'number' ? rule.max : Number(rule.max);
          if (numValue > maxValue) {
            return typeof rule.max === 'string' && rule.max.includes('%')
              ? rule.max.replace('%d', maxValue.toString())
              : `${String(fieldName)} must be no more than ${maxValue}`;
          }
        }
      }

      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          return typeof result === 'string' ? result : `${String(fieldName)} is invalid`;
        }
      }

      return undefined;
    },
    [schema]
  );

  // Memoized validation function for all fields
  const validateForm = useCallback((): FormErrors<T> => {
    const newErrors: FormErrors<T> = {};
    
    for (const fieldName in schema) {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    }
    
    return newErrors;
  }, [schema, values, validateField]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(validateForm()).length === 0;
  }, [validateForm]);

  // Check if any field has been touched
  const isTouched = useMemo(() => {
    return Object.values(touched).some(Boolean);
  }, [touched]);

  // Set field value
  const setValue = useCallback((fieldName: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    if (validateOnChange) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [validateField, validateOnChange]);

  // Set multiple values
  const setValues_ = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
    
    if (validateOnChange) {
      const newErrors: FormErrors<T> = {};
      for (const fieldName in newValues) {
        const error = validateField(fieldName, newValues[fieldName]);
        newErrors[fieldName] = error;
      }
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  }, [validateField, validateOnChange]);

  // Mark field as touched
  const touchField = useCallback((fieldName: keyof T) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    if (validateOnBlur) {
      const error = validateField(fieldName, values[fieldName]);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [validateField, validateOnBlur, values]);

  // Reset form
  const resetForm = useCallback((newValues?: Partial<T>) => {
    setValues(newValues ? { ...initialValues, ...newValues } : initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Submit handler
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => 
      async (event?: React.FormEvent) => {
        if (event) {
          event.preventDefault();
        }

        setIsSubmitting(true);

        if (validateOnSubmit) {
          const formErrors = validateForm();
          setErrors(formErrors);

          if (Object.keys(formErrors).length > 0) {
            setIsSubmitting(false);
            return;
          }
        }

        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      },
    [values, validateForm, validateOnSubmit]
  );

  // Field helpers
  const getFieldProps = useCallback((fieldName: keyof T) => ({
    value: values[fieldName],
    onChange: (value: any) => setValue(fieldName, value),
    onBlur: () => touchField(fieldName),
    error: touched[fieldName] ? errors[fieldName] : undefined,
  }), [values, setValue, touchField, touched, errors]);

  return {
    values,
    errors,
    touched,
    isValid,
    isTouched,
    isSubmitting,
    setValue,
    setValues: setValues_,
    touchField,
    resetForm,
    handleSubmit,
    getFieldProps,
    validateField,
    validateForm,
  };
}