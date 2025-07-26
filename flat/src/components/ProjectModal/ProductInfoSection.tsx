import React, { useCallback } from 'react';
import { Package } from 'lucide-react';
import type { ProjectData } from './types';
import { productTypes } from '../../data/mockData';
import { SERVICE_TYPE_OPTIONS } from '../../constants';

interface ProductInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const ProductInfoSectionComponent: React.FC<ProductInfoSectionProps> = ({ formData, onChange }) => {
  const handleProductTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ productType: e.target.value });
  }, [onChange]);
  
  const handleServiceTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ serviceType: e.target.value });
  }, [onChange]);
  
  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Package />
        제품 정보
      </div>
      <div className="modal-grid-2">
        <div className="modal-field-spacing">
          <label className="modal-field-label">
            제품 타입 *
          </label>
          <select
            value={formData.productType}
            onChange={handleProductTypeChange}
            className="modal-input cursor-pointer"
            required
          >
            <option value="">제품 타입을 선택하세요</option>
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="modal-field-spacing">
          <label className="modal-field-label">
            서비스 유형
          </label>
          <select
            value={formData.serviceType}
            onChange={handleServiceTypeChange}
            className="modal-input cursor-pointer"
          >
            {SERVICE_TYPE_OPTIONS.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const ProductInfoSection = React.memo(ProductInfoSectionComponent);

export default ProductInfoSection;