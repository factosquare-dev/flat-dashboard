/**
 * Basic information form section
 */

import React from 'react';
import { FormInput } from '@/components/forms';
import type { FormFieldProps } from '@/components/types';

export const BasicInfoForm: React.FC<FormFieldProps> = ({ 
  formData, 
  updateFormData, 
  errors 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">기본 정보</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="브랜드명"
          name="brandName"
          value={formData.brandName}
          onChange={(e) => updateFormData('brandName', e.target.value)}
          placeholder="브랜드명을 입력하세요"
          error={errors.brandName}
          required
        />
        
        <FormInput
          label="타겟 제품명"
          name="targetProduct"
          value={formData.targetProduct}
          onChange={(e) => updateFormData('targetProduct', e.target.value)}
          placeholder="제품명을 입력하세요"
          error={errors.targetProduct}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="수령 방법"
          name="receiveMethod"
          value={formData.receiveMethod}
          onChange={(e) => updateFormData('receiveMethod', e.target.value)}
          placeholder="예: 택배, 직접수령"
        />
        
        <FormInput
          label="납품 수량"
          name="deliveryQuantity"
          value={formData.deliveryQuantity}
          onChange={(e) => updateFormData('deliveryQuantity', e.target.value)}
          placeholder="예: 1,000개"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="사용처"
          name="usageLocation"
          value={formData.usageLocation}
          onChange={(e) => updateFormData('usageLocation', e.target.value)}
          placeholder="예: 온라인몰, 오프라인 매장"
        />
        
        <FormInput
          label="소비자가 단위"
          name="consumptionUnit"
          value={formData.consumptionUnit}
          onChange={(e) => updateFormData('consumptionUnit', e.target.value)}
          placeholder="예: 50,000원"
        />
      </div>
    </div>
  );
};