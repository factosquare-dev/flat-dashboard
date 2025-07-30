import { useState, useCallback, useRef } from 'react';
import { useToast } from './useToast';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [field: string]: ValidationRule;
}

interface ValidationErrors {
  [field: string]: string;
}

interface UseModalFormValidationOptions {
  rules: ValidationRules;
  onSubmit: (data: any) => void;
  resetOnSubmit?: boolean;
}

export const useModalFormValidation = <T extends Record<string, any>>(
  initialData: T,
  options: UseModalFormValidationOptions
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: toastError } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = options.rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required) {
      if (value === undefined || value === null || value === '') {
        return '필수 입력 항목입니다';
      }
      if (typeof value === 'string' && !value.trim()) {
        return '필수 입력 항목입니다';
      }
    }

    // Skip other validations if value is empty and not required
    if (!value && !rule.required) return null;

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return `최소 ${rule.minLength}자 이상 입력해주세요`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return `최대 ${rule.maxLength}자까지 입력 가능합니다`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return '올바른 형식으로 입력해주세요';
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [options.rules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let hasError = false;

    Object.keys(options.rules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    setErrors(newErrors);
    return !hasError;
  }, [formData, options.rules, validateField]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it has been touched
    if (touched.has(field)) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }
  }, [touched, validateField]);

  const handleFieldBlur = useCallback((field: string) => {
    setTouched(prev => new Set(prev).add(field));
    
    // Validate on blur
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
  }, [formData, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    setTouched(new Set(Object.keys(options.rules)));

    // Validate form
    if (!validateForm()) {
      // Focus first error field
      if (formRef.current) {
        const firstErrorField = Object.keys(errors).find(field => errors[field]);
        if (firstErrorField) {
          const element = formRef.current.querySelector(`[name="${firstErrorField}"]`);
          if (element instanceof HTMLElement) {
            element.focus();
          }
        }
      }

      // Show toast with validation error
      const errorFields = Object.keys(errors)
        .filter(field => errors[field])
        .map(field => {
          const label = formRef.current?.querySelector(`[for="${field}"]`)?.textContent || field;
          return label;
        });

      toastError('입력 오류', `다음 항목을 확인해주세요: ${errorFields.join(', ')}`);
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await options.onSubmit(formData);
      
      // Reset form if specified
      if (options.resetOnSubmit) {
        setFormData(initialData);
        setErrors({});
        setTouched(new Set());
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, errors, options, toastError, initialData]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched(new Set());
  }, [initialData]);

  const getFieldProps = useCallback((field: string) => ({
    value: formData[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
      handleFieldChange(field, e.target.value),
    onBlur: () => handleFieldBlur(field),
    error: errors[field],
    required: options.rules[field]?.required,
    name: field,
    id: field
  }), [formData, errors, handleFieldChange, handleFieldBlur, options.rules]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    formRef,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    resetForm,
    getFieldProps,
    validateField,
    validateForm,
    setFormData
  };
};