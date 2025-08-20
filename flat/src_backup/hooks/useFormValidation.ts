import { useState, useCallback, useMemo } from 'react';

type ValidationRule<T> = (value: T) => string | null;

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
  isDirty: boolean;
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  handleBlur: (field: keyof T) => void;
  validate: () => boolean;
  validateField: (field: keyof T) => boolean;
  reset: () => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
}

/**
 * Custom hook for form validation
 * @param options - Form validation options
 * @returns Form state and validation functions
 */
export function useFormValidation<T extends Record<string, unknown>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const {
    initialValues,
    validationRules = {},
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const isDirty = useMemo(() => {
    return Object.keys(values).some(
      key => values[key as keyof T] !== initialValues[key as keyof T]
    );
  }, [values, initialValues]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const validateField = useCallback(
    (field: keyof T): boolean => {
      const value = values[field];
      const rules = validationRules[field];

      if (!rules) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      }

      const rulesArray = Array.isArray(rules) ? rules : [rules];
      
      for (const rule of rulesArray) {
        const error = rule(value);
        if (error) {
          setErrors(prev => ({ ...prev, [field]: error }));
          return false;
        }
      }

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    },
    [values, validationRules]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    (Object.keys(validationRules) as Array<keyof T>).forEach(field => {
      const value = values[field];
      const rules = validationRules[field];
      if (!rules) return;
      
      const rulesArray = Array.isArray(rules) ? rules : [rules];

      for (const rule of rulesArray) {
        const error = rule(value);
        if (error) {
          newErrors[field] = error;
          isValid = false;
          break;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  const handleChange = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues(prev => ({ ...prev, [field]: value }));
      
      if (validateOnChange && touched[field]) {
        validateField(field);
      }
    },
    [validateOnChange, touched, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      
      if (validateOnBlur) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, []);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    validate,
    validateField,
    reset,
    setFieldValue,
    setFieldError,
  };
}

// Common validation rules
export const validationRules = {
  required: (message = '필수 입력 항목입니다') => (value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    return null;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `최소 ${min}자 이상 입력해주세요`;
    }
    return null;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `최대 ${max}자까지 입력 가능합니다`;
    }
    return null;
  },

  email: (message = '올바른 이메일 형식이 아닙니다') => (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return null;
  },

  phone: (message = '올바른 전화번호 형식이 아닙니다') => (value: string) => {
    if (value && !/^010-\d{4}-\d{4}$/.test(value)) {
      return message;
    }
    return null;
  },

  number: (message = '숫자만 입력 가능합니다') => (value: unknown) => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  min: (min: number, message?: string) => (value: number) => {
    if (value !== null && value !== undefined && value < min) {
      return message || `${min} 이상의 값을 입력해주세요`;
    }
    return null;
  },

  max: (max: number, message?: string) => (value: number) => {
    if (value !== null && value !== undefined && value > max) {
      return message || `${max} 이하의 값을 입력해주세요`;
    }
    return null;
  },

  pattern: (pattern: RegExp, message: string) => (value: string) => {
    if (value && !pattern.test(value)) {
      return message;
    }
    return null;
  },
};