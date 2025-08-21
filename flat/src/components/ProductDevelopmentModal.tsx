import React, { useEffect } from 'react';
import { ProductDevelopmentForm } from '@/modules/products/ProductDevelopmentForm';
import { X } from 'lucide-react';

interface ProductDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDevelopmentModal: React.FC<ProductDevelopmentModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-[480px] max-w-[480px] max-h-[90vh] overflow-hidden z-10 mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">제품 개발 의뢰서</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
          <ProductDevelopmentForm />
        </div>
      </div>
    </div>
  );
};