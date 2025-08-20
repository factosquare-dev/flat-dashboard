import { useState, useCallback } from 'react';

type ValidationRule<T> = (value: T) => string | undefined;
type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]> | ValidationRule<T[K]>[];
};

interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  handleChange: <K extends keyof T>(field: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
}

/**
 * Custom hook for form validation
 */
export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  validateOnChange = true,
  validateOnBlur = true
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const runValidation = useCallback((field: keyof T, value: any): string | undefined => {
    const rules = validationRules[field];
    if (!rules) return undefined;

    const ruleArray = Array.isArray(rules) ? rules : [rules];
    
    for (const rule of ruleArray) {
      const error = rule(value);
      if (error) return error;
    }
    
    return undefined;
  }, [validationRules]);

  const validateField = useCallback((field: keyof T): boolean => {
    const error = runValidation(field, values[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    return !error;
  }, [values, runValidation]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = runValidation(field as keyof T, values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, runValidation]);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));

    if (validateOnChange && touched[field]) {
      const error = runValidation(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [touched, validateOnChange, runValidation]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
  }, []);

  const handleChange = useCallback(<K extends keyof T>(field: K) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value as T[K];
      setFieldValue(field, value);
    };
  }, [setFieldValue]);

  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setFieldTouched(field, true);
      if (validateOnBlur) {
        validateField(field);
      }
    };
  }, [setFieldTouched, validateOnBlur, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    handleChange,
    handleBlur
  };
}

// Common validation rules
export const validationRules = {
  required: (message = '필수 입력 항목입니다') => (value: any) => {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    return undefined;
  },

  email: (message = '올바른 이메일 형식이 아닙니다') => (value: string) => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? undefined : message;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (!value) return undefined;
    return value.length >= min ? undefined : message || `최소 ${min}자 이상 입력해주세요`;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (!value) return undefined;
    return value.length <= max ? undefined : message || `최대 ${max}자까지 입력 가능합니다`;
  },

  pattern: (regex: RegExp, message = '올바른 형식이 아닙니다') => (value: string) => {
    if (!value) return undefined;
    return regex.test(value) ? undefined : message;
  },

  phone: (message = '올바른 전화번호 형식이 아닙니다') => (value: string) => {
    if (!value) return undefined;
    const phoneRegex = /^[\d-]+$/;
    return phoneRegex.test(value) ? undefined : message;
  }
};