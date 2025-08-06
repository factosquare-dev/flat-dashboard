/**
 * Product request form hook
 */

import { useState, useCallback } from 'react';
import { useModalFormValidation } from '@/hooks/useModalFormValidation';
import type { ProductRequestData } from '../types';

const initialFormData: ProductRequestData = {
  brandName: '',
  targetProduct: '',
  receiveMethod: '',
  deliveryQuantity: '',
  usageLocation: '',
  consumptionUnit: '',
  receiptInfo: {
    targetType: '',
    useGuidance: '',
    quantity: '',
    shape: '',
    requiredFormulation: '',
  },
  contentInfo: {
    containerSpecifications: '',
    fillingVolume: '',
    functionalComponent: '',
    mainIngredient: '',
    productionPreference: '',
  },
  deliverySchedule: '',
  requirements: '',
};

export const useProductRequestForm = () => {
  const [formData, setFormData] = useState<ProductRequestData>(initialFormData);
  
  const { errors, validateField, validateForm, clearError } = useModalFormValidation({
    brandName: { required: true },
    targetProduct: { required: true },
  });

  const updateFormData = useCallback((field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    
    if (errors[field]) {
      clearError(field);
    }
  }, [errors, clearError]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  return {
    formData,
    updateFormData,
    resetForm,
    errors,
    validateForm
  };
};