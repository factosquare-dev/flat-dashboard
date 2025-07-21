import React from 'react';
import { Calendar, Mail } from 'lucide-react';
import type { Priority, ServiceType, ProjectStatus } from '../../types/project';
import DateRangeFilter from './DateRangeFilter';

interface ProjectFiltersProps {
  selectedPriority: Priority | 'all';
  selectedServiceType: ServiceType | 'all';
  statusFilters: ProjectStatus[];
  searchValue: string;
  dateRange: { start: string | null; end: string | null };
  onPriorityChange: (priority: Priority | 'all') => void;
  onServiceTypeChange: (serviceType: ServiceType | 'all') => void;
  onStatusFilterToggle: (status: ProjectStatus) => void;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (range: { start: string | null; end: string | null }) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  selectedPriority,
  selectedServiceType,
  statusFilters,
  searchValue,
  dateRange,
  onPriorityChange,
  onServiceTypeChange,
  onStatusFilterToggle,
  onSearchChange,
  onDateRangeChange
}) => {
  return (
    <div className="space-y-2">
      {/* 검색 영역 */}
      <div className="relative">
        <input
          type="text"
          placeholder="프로젝트명, 고객명, 공장명으로 검색..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all hover:bg-white"
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* 필터 영역 */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-medium">필터:</span>
        </div>
        
        {/* Status Filters */}
        <div className="flex gap-1">
          {(['시작전', '진행중', '완료', '중단'] as ProjectStatus[]).map(status => (
            <button
              key={status}
              onClick={() => onStatusFilterToggle(status)}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                statusFilters.includes(status)
                  ? status === '시작전' 
                    ? 'bg-gray-600 text-white shadow-md'
                    : status === '진행중'
                    ? 'bg-blue-600 text-white shadow-md'
                    : status === '완료'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="h-4 w-px bg-gray-300" />
        
        {/* Priority Filter */}
        <select 
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value as Priority | 'all')}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-xs text-gray-700 hover:bg-gray-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-xs text-gray-700 hover:bg-gray-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">모든 서비스 유형</option>
        <option value="OEM">OEM</option>
        <option value="ODM">ODM</option>
        <option value="OBM">OBM</option>
        <option value="Private Label">Private Label</option>
        <option value="White Label">White Label</option>
        <option value="기타">기타</option>
        </select>
        
        <div className="h-4 w-px bg-gray-300" />
        
        {/* 날짜 필터 */}
        <DateRangeFilter
          value={{ startDate: dateRange.start, endDate: dateRange.end }}
          onChange={(range) => onDateRangeChange({ start: range.startDate, end: range.endDate })}
        />
      </div>
    </div>
  );
};

export default ProjectFilters;