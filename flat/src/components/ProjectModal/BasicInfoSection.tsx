import React from 'react';
import { Users } from 'lucide-react';
import type { ProjectData } from './types';

interface BasicInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600" />
        기본 정보
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            고객명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => onChange({ client: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="고객명을 입력하세요"
            required
          />
        </div>
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            담당자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.manager}
            onChange={(e) => onChange({ manager: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="담당자명을 입력하세요"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;