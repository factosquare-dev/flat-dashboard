/**
 * Delivery and requirements form section
 */

import React from 'react';
import { FormInput, FormTextarea } from '@/components/forms';
import type { FormFieldProps } from '@/components/types';

export const DeliveryForm: React.FC<FormFieldProps> = ({ 
  formData, 
  updateFormData, 
  errors 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <FormInput
          label="납품 일정"
          name="deliverySchedule"
          value={formData.deliverySchedule}
          onChange={(e) => updateFormData('deliverySchedule', e.target.value)}
          placeholder="예: 2024년 3월 말"
          error={errors.deliverySchedule}
        />
      </div>
      
      <div>
        <FormTextarea
          label="기타 요구사항"
          name="requirements"
          value={formData.requirements}
          onChange={(e) => updateFormData('requirements', e.target.value)}
          placeholder="추가 요구사항을 입력하세요"
          rows={4}
        />
      </div>
    </div>
  );
};