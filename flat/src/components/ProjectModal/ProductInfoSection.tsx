import React from 'react';
import { Package } from 'lucide-react';
import type { ProjectData } from './types';

interface ProductInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-purple-600" />
        제품 정보
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제품 타입 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.productType}
            onChange={(e) => onChange({ productType: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="예: 스킨케어, 메이크업 등"
            required
          />
        </div>
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            서비스 유형
          </label>
          <select
            value={formData.serviceType}
            onChange={(e) => onChange({ serviceType: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="OEM">OEM</option>
            <option value="ODM">ODM</option>
            <option value="OBM">OBM</option>
            <option value="Private Label">Private Label</option>
            <option value="White Label">White Label</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoSection;