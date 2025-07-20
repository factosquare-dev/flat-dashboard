import React from 'react';
import { Building2 } from 'lucide-react';
import type { ProjectData } from './types';

interface FactoryInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const FactoryInfoSection: React.FC<FactoryInfoSectionProps> = ({ formData, onChange }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-indigo-600" />
        공장 정보
      </h3>
      <div className="grid grid-cols-3 gap-6">
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">제조</label>
          <input
            type="text"
            value={formData.manufacturer}
            onChange={(e) => onChange({ manufacturer: e.target.value })}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="제조 공장"
          />
        </div>
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">용기</label>
          <input
            type="text"
            value={formData.container}
            onChange={(e) => onChange({ container: e.target.value })}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="용기 공장"
          />
        </div>
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">포장</label>
          <input
            type="text"
            value={formData.packaging}
            onChange={(e) => onChange({ packaging: e.target.value })}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="포장 공장"
          />
        </div>
      </div>
    </div>
  );
};

export default FactoryInfoSection;