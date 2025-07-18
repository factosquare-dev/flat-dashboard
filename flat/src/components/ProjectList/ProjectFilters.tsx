import React from 'react';
import type { Priority, ServiceType, ProjectStatus } from '../../types/project';

interface ProjectFiltersProps {
  selectedPriority: Priority | 'all';
  selectedServiceType: ServiceType | 'all';
  statusFilters: ProjectStatus[];
  onPriorityChange: (priority: Priority | 'all') => void;
  onServiceTypeChange: (serviceType: ServiceType | 'all') => void;
  onStatusFilterToggle: (status: ProjectStatus) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  selectedPriority,
  selectedServiceType,
  statusFilters,
  onPriorityChange,
  onServiceTypeChange,
  onStatusFilterToggle
}) => {
  return (
    <div className="flex flex-wrap gap-3 flex-1">
      {/* Priority Filter */}
      <select 
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value as Priority | 'all')}
        className="form-select bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 rounded-lg px-4 py-2.5 font-medium text-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <option value="all">모든 우선순위</option>
        <option value="높음">높음</option>
        <option value="보통">보통</option>
        <option value="낮음">낮음</option>
      </select>

      {/* Service Type Filter */}
      <select 
        value={selectedServiceType}
        onChange={(e) => onServiceTypeChange(e.target.value as ServiceType | 'all')}
        className="form-select bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 rounded-lg px-4 py-2.5 font-medium text-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <option value="all">모든 서비스 유형</option>
        <option value="OEM">OEM</option>
        <option value="ODM">ODM</option>
        <option value="OBM">OBM</option>
        <option value="Private Label">Private Label</option>
        <option value="White Label">White Label</option>
        <option value="기타">기타</option>
      </select>

      {/* Status Filters */}
      <div className="flex gap-2">
        {(['시작전', '진행중', '완료'] as ProjectStatus[]).map(status => (
          <button
            key={status}
            onClick={() => onStatusFilterToggle(status)}
            className={`px-4 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all ${
              statusFilters.includes(status)
                ? status === '시작전' 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                  : status === '진행중'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectFilters;