import React from 'react';
import { Plus, Mail } from 'lucide-react';
import { PageLayout, FloatingActionButton } from '../../common';
import ProjectActions from '../ProjectActions';
import type { Priority, ServiceType, ProjectStatus } from '../../../types/project';

interface ProjectListLayoutProps {
  containerStyle: { top: string; left: string };
  onRefresh: () => void;
  onSendEmail: () => void;
  onSearch: (query: string) => void;
  onCreateProject: () => void;
  children: React.ReactNode;
  selectedPriority?: Priority | 'all';
  selectedServiceType?: ServiceType | 'all';
  statusFilters?: ProjectStatus[];
  searchValue?: string;
  dateRange?: { start: string | null; end: string | null };
  totalProjects?: number;
  onPriorityChange?: (priority: Priority | 'all') => void;
  onServiceTypeChange?: (serviceType: ServiceType | 'all') => void;
  onStatusFilterToggle?: (status: ProjectStatus) => void;
  onDateRangeChange?: (range: { start: string | null; end: string | null }) => void;
}

const ProjectListLayout: React.FC<ProjectListLayoutProps> = ({
  containerStyle,
  onRefresh,
  onSendEmail,
  onSearch,
  onCreateProject,
  children,
  selectedPriority,
  selectedServiceType,
  statusFilters,
  searchValue,
  dateRange,
  totalProjects,
  onPriorityChange,
  onServiceTypeChange,
  onStatusFilterToggle,
  onDateRangeChange
}) => {
  const header = (
    <ProjectActions 
      selectedPriority={selectedPriority || 'all'}
      selectedServiceType={selectedServiceType || 'all'}
      statusFilters={statusFilters || []}
      searchValue={searchValue || ''}
      dateRange={dateRange || { start: null, end: null }}
      totalProjects={totalProjects || 0}
      onPriorityChange={onPriorityChange || (() => {})}
      onServiceTypeChange={onServiceTypeChange || (() => {})}
      onStatusFilterToggle={onStatusFilterToggle || (() => {})}
      onDateRangeChange={onDateRangeChange || (() => {})}
      onSearchChange={onSearch}
      onCreateProject={onCreateProject}
      onSendEmail={onSendEmail}
    />
  );

  const floatingActions = (
    <>
      <FloatingActionButton
        onClick={onSendEmail}
        icon={<Mail />}
        label="메일 보내기"
        variant="secondary"
        position="second"
      />
      <FloatingActionButton
        onClick={onCreateProject}
        icon={<Plus />}
        label="새 프로젝트"
        variant="primary"
        position="first"
      />
    </>
  );

  return (
    <PageLayout
      containerStyle={containerStyle}
      header={header}
      floatingActions={floatingActions}
    >
      {children}
    </PageLayout>
  );
};

export default ProjectListLayout;