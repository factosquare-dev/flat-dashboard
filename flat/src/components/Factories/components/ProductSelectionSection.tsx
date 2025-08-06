import React, { useState, useEffect } from 'react';
import { Package, Search, X } from 'lucide-react';
import { mockDataService } from '@/services/mockDataService';
import type { Product } from '@/types/product';
import type { ProductId } from '@/types/branded';

interface ProductSelectionSectionProps {
  selectedProductIds: ProductId[];
  onProductsChange: (productIds: ProductId[]) => void;
}

const ProductSelectionSection: React.FC<ProductSelectionSectionProps> = ({
  selectedProductIds,
  onProductsChange,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Load products from MockDatabase
    const allProducts = mockDataService.getProducts();
    setProducts(allProducts);
  }, []);

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
  
  const filteredProducts = products.filter(product => 
    !selectedProductIds.includes(product.id) &&
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.code?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProduct = (productId: ProductId) => {
    onProductsChange([...selectedProductIds, productId]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemoveProduct = (productId: ProductId) => {
    onProductsChange(selectedProductIds.filter(id => id !== productId));
  };

  return (
    <div className="modal-field-spacing">
      <label className="modal-field-label flex items-center gap-2">
        <Package className="w-4 h-4" />
        생산 가능 제품
      </label>
      
      {/* Selected products */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedProducts.map((product) => (
            <div
              key={product.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              <span>{product.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveProduct(product.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Product search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="제품명 또는 제품 코드로 검색"
            className="modal-input pl-10 text-sm"
          />
        </div>

        {/* Dropdown */}
        {isDropdownOpen && searchTerm && filteredProducts.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleAddProduct(product.id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{product.name}</div>
                  {product.code && (
                    <div className="text-xs text-gray-500">코드: {product.code}</div>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {product.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductSelectionSection;