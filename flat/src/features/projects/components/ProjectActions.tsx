import React from 'react';
import { Plus, Mail, Search, Filter, Eye, EyeOff } from 'lucide-react';
import type { Priority, ServiceType, ProjectStatus } from '../../types/project';
import type { Column } from '../../hooks/useColumnOrder';
import ProjectFilters from './ProjectFilters';
import ColumnVisibilityDropdown from './ColumnVisibilityDropdown';

interface ProjectActionsProps {
  selectedPriority: Priority | 'all';
  selectedServiceType: ServiceType | 'all';
  statusFilters: ProjectStatus[];
  searchValue: string;
  dateRange: { start: string | null; end: string | null };
  totalProjects: number;
  filteredCount?: number;
  columns?: Column[];
  hiddenColumns?: Set<string>;
  onPriorityChange: (priority: Priority | 'all') => void;
  onServiceTypeChange: (serviceType: ServiceType | 'all') => void;
  onStatusFilterToggle: (status: ProjectStatus) => void;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (range: { start: string | null; end: string | null }) => void;
  onCreateProject: () => void;
  onSendEmail: () => void;
  onToggleColumn?: (columnId: string) => void;
  onShowAllColumns?: () => void;
  onHideAllColumns?: () => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
  selectedPriority,
  selectedServiceType,
  statusFilters,
  searchValue,
  dateRange,
  totalProjects,
  filteredCount,
  columns = [],
  hiddenColumns = new Set(),
  onPriorityChange,
  onServiceTypeChange,
  onStatusFilterToggle,
  onSearchChange,
  onDateRangeChange,
  onCreateProject,
  onSendEmail,
  onToggleColumn,
  onShowAllColumns,
  onHideAllColumns
}) => {
  return (
    <div className="w-full max-w-full">
      {/* 검색 및 필터 영역 */}
      <div className="bg-white">
        <div className="flex items-center justify-between">
          <ProjectFilters
            selectedPriority={selectedPriority}
            selectedServiceType={selectedServiceType}
            statusFilters={statusFilters}
            searchValue={searchValue}
            dateRange={dateRange}
            onPriorityChange={onPriorityChange}
            onServiceTypeChange={onServiceTypeChange}
            onStatusFilterToggle={onStatusFilterToggle}
            onSearchChange={onSearchChange}
            onDateRangeChange={onDateRangeChange}
          />
          {onToggleColumn && onShowAllColumns && onHideAllColumns && (
            <ColumnVisibilityDropdown
              columns={columns}
              hiddenColumns={hiddenColumns}
              onToggleColumn={onToggleColumn}
              onShowAll={onShowAllColumns}
              onHideAll={onHideAllColumns}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectActions;