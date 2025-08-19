import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

interface ProductServiceSelectorProps {
  productId?: string;
  serviceType?: string;
  onChange: (updates: { productId?: string; serviceType?: string }) => void;
  required?: boolean;
}

const ProductServiceSelector: React.FC<ProductServiceSelectorProps> = ({
  productId,
  serviceType,
  onChange,
  required = false
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);

  const db = MockDatabaseImpl.getInstance();

  useEffect(() => {
    // Load products
    const productsResult = db.getAll('products');
    if (productsResult.success && productsResult.data) {
      setProducts(productsResult.data);
    }

    // Load service types from serviceTypeMappings
    const serviceTypesResult = db.getAll('serviceTypeMappings');
    if (serviceTypesResult.success && serviceTypesResult.data) {
      const mappedServiceTypes = serviceTypesResult.data.map((mapping: any) => ({
        id: mapping.id,
        value: mapping.code,
        label: mapping.displayName,
        description: mapping.description
      }));
      setServiceTypes(mappedServiceTypes);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Product Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제품 {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              className="w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={productId || ''}
              onChange={(e) => onChange({ productId: e.target.value })}
              required={required}
            >
              <option value="">제품 선택</option>
              {products && products.length > 0 &&
                products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))
              }
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Service Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            서비스 유형 {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              className="w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={serviceType || ''}
              onChange={(e) => onChange({ serviceType: e.target.value })}
              required={required}
            >
              <option value="">서비스 선택</option>
              {serviceTypes && serviceTypes.length > 0 &&
                serviceTypes.map(type => (
                  <option key={type.id} value={type.value}>
                    {type.label}
                  </option>
                ))
              }
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductServiceSelector;