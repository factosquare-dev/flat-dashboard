import React from 'react';
import { Calendar } from 'lucide-react';
import type { ProjectData } from './types';

interface ScheduleSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-green-600" />
        일정
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시작일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            마감일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;