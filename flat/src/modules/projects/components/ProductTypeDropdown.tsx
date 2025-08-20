import React, { useState, useRef, useMemo } from 'react';
import { ProductType, ProductTypeLabel } from '@/shared/types/enums';
import SearchBox from './SearchBox';
import { mockDataService } from '@/core/services/mockDataService';

interface ProductTypeDropdownProps {
  value: ProductType | string;
  onChange: (value: ProductType) => void;
  disabled?: boolean;
  project?: any; // For consistency with other searchable cells
}

const ProductTypeDropdown: React.FC<ProductTypeDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  project
}) => {
  const [showSearchBox, setShowSearchBox] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  // Get product categories from MockDB
  const productTypeData = useMemo(() => {
    try {
      const categories = mockDataService.getProductCategoriesFlat();
      return categories.map(category => ({
        id: category.id,
        name: category.fullPath,
        searchableText: category.fullPath
      }));
    } catch (error) {
      // Fallback to enum data if MockDB fails
      return Object.entries(ProductTypeLabel).map(([key, label]) => ({
        id: key,
        name: label,
        searchableText: label
      }));
    }
  }, []);

  const currentLabel = useMemo(() => {
    const category = productTypeData.find(item => item.id === value);
    return category ? category.name : (value ? ProductTypeLabel[value as ProductType] || value : '-');
  }, [value, productTypeData]);

  return (
    <>
      <div
        ref={cellRef}
        onClick={() => !disabled && setShowSearchBox(true)}
        className={`
          px-2 py-1.5 text-xs cursor-pointer group js-inline-edit
          ${disabled ? 'text-gray-500' : 'text-gray-700 hover:text-gray-900'}
        `}
      >
        <div className="truncate" title={currentLabel}>
          {currentLabel}
        </div>
      </div>
      
      <SearchBox
        isOpen={showSearchBox}
        onClose={() => setShowSearchBox(false)}
        onSelect={(item) => {
          onChange(item.id as ProductType);
          setShowSearchBox(false);
        }}
        anchorElement={cellRef.current}
        data={productTypeData}
        placeholder="제품 유형 검색..."
      />
    </>
  );
};

export default ProductTypeDropdown;