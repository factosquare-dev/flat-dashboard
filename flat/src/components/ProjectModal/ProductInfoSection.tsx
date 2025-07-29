import React, { useCallback, useMemo } from 'react';
import { Package } from 'lucide-react';
import type { ProjectData } from './types';
import { productTypes } from '../../data/mockData';
import { SERVICE_TYPE_OPTIONS } from '../../constants';
import { mockDataService } from '../../services/mockDataService';

interface ProductInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const ProductInfoSectionComponent: React.FC<ProductInfoSectionProps> = ({ formData, onChange }) => {
  // Get products from MockDB with category information
  const availableProducts = useMemo(() => {
    try {
      return mockDataService.getProductsWithCategory();
    } catch (error) {
      console.warn('Failed to load products from MockDB, using fallback data:', error);
      return productTypes.map(type => ({
        id: type,
        name: type,
        categoryName: type,
        categoryPath: type
      }));
    }
  }, []);

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
            제품 선택 *
          </label>
          <select
            value={formData.productType}
            onChange={handleProductTypeChange}
            className="modal-input cursor-pointer"
            required
          >
            <option value="">제품을 선택하세요</option>
            {availableProducts.map(product => (
              <option key={product.id} value={product.name}>
                {product.name} ({product.categoryPath})
              </option>
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