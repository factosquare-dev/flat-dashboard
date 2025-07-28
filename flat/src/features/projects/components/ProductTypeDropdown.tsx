import React from 'react';
import { ProductType, ProductTypeLabel } from '@/types/enums';

interface ProductTypeDropdownProps {
  value: ProductType | string;
  onChange: (value: ProductType) => void;
  disabled?: boolean;
}

const ProductTypeDropdown: React.FC<ProductTypeDropdownProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      onChange(newValue as ProductType);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`
        w-full px-2 py-1 text-xs border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
      `}
    >
      <option value="">선택하세요</option>
      {Object.entries(ProductTypeLabel).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default ProductTypeDropdown;