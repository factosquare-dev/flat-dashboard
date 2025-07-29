import React from 'react';
import ProductTypeCategoryManager from '../../components/ProductTypes/ProductTypeCategoryManager';

const ProductTypes: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-auto p-6">
        <ProductTypeCategoryManager />
      </div>
    </div>
  );
};

export default ProductTypes;