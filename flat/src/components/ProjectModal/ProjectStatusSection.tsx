import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ProjectData } from './types';
import { ProjectStatus, ProjectStatusLabel, Priority, PriorityLabel } from '@/types/enums';

interface ProjectStatusSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const ProjectStatusSection: React.FC<ProjectStatusSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600" />
        프로젝트 상태
      </h3>
      <div className="grid grid-cols-3 gap-6">
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
          <select
            value={formData.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
          >
            {Object.entries(ProjectStatusLabel).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
          <select
            value={formData.priority}
            onChange={(e) => onChange({ priority: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
          >
            {Object.entries(PriorityLabel).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">진행률</label>
          <div className="flex items-center h-[50px]">
            <span className="text-sm text-gray-500">자동 계산됨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusSection;