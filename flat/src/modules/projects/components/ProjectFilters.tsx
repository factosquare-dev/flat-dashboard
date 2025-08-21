import React from 'react';
import { Calendar, Mail } from 'lucide-react';
import { Priority, PriorityLabel, ServiceType, ServiceTypeLabel, ProjectStatus } from '@/shared/types/enums';
import DateRangeFilter from './DateRangeFilter';
import { getStatusStyles, getAllStatuses, getAllPriorities, getAllServiceTypes } from '@/shared/utils/statusUtils';
import '@/shared/styles/button.css';

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
        <label htmlFor="project-search" className="sr-only">프로젝트 검색</label>
        <input
          id="project-search"
          type="text"
          placeholder="프로젝트명, 고객명, 공장명으로 검색..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs transition-all hover:bg-white"
          aria-label="프로젝트 검색"
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
        <div className="flex gap-1" role="group" aria-label="상태 필터">
          {getAllStatuses('project').map(statusInfo => {
            const isSelected = statusFilters.includes(statusInfo.code as ProjectStatus);
            const isPlanningStatus = statusInfo.code.toUpperCase() === 'PLANNING';
            
            return (
              <button
                key={statusInfo.code}
                onClick={() => onStatusFilterToggle(statusInfo.code as ProjectStatus)}
                className={`px-3 py-1.5 h-8 rounded-full text-xs font-medium transition-all border ${
                  isSelected
                    ? isPlanningStatus
                      ? 'bg-slate-600 text-white border-slate-700 shadow-sm'
                      : `${getStatusStyles(statusInfo.code, 'project')} shadow-sm`
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={isSelected}
                aria-label={`${statusInfo.displayName} 상태 필터 ${isSelected ? '선택됨' : '선택 안됨'}`}
              >
                {statusInfo.displayName}
              </button>
            );
          })}
        </div>
        
        <div className="h-4 w-px bg-gray-300" />
        
        {/* Priority Filter */}
        <label htmlFor="priority-filter" className="sr-only">우선순위 필터</label>
        <select 
          id="priority-filter"
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value as Priority | 'all')}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-xs text-gray-700 hover:bg-gray-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="우선순위 필터 선택"
      >
        <option value="all">모든 우선순위</option>
        {getAllPriorities().map(priority => (
          <option key={priority.code} value={priority.code}>{priority.displayName}</option>
        ))}
      </select>

        {/* Service Type Filter */}
        <label htmlFor="service-type-filter" className="sr-only">서비스 유형 필터</label>
        <select 
          id="service-type-filter"
          value={selectedServiceType}
          onChange={(e) => onServiceTypeChange(e.target.value as ServiceType | 'all')}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-xs text-gray-700 hover:bg-gray-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="서비스 유형 필터 선택"
      >
        <option value="all">모든 서비스 유형</option>
        {getAllServiceTypes().map(serviceType => (
          <option key={serviceType.code} value={serviceType.code}>{serviceType.displayName}</option>
        ))}
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