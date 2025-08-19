import React from 'react';
import { Plus, Mail, FileEdit, Factory } from 'lucide-react';
import { PageLayout, FloatingActionButton } from '@/components/common';
import ProjectActions from '@/features/projects/components/ProjectActions';
import type { Priority, ServiceType, ProjectStatus } from '@/types/project';
import type { Column } from '@/hooks/useColumnOrder';
import { ButtonVariant } from '@/types/enums';

interface ProjectListLayoutProps {
  containerStyle: { top: string; left: string };
  onRefresh: () => void;
  onSendEmail: () => void;
  onSearch: (query: string) => void;
  onCreateProject: () => void;
  children: React.ReactNode;
  isTaskView?: boolean;
  selectedPriority?: Priority | 'all';
  selectedServiceType?: ServiceType | 'all';
  statusFilters?: ProjectStatus[];
  searchValue?: string;
  dateRange?: { start: string | null; end: string | null };
  totalProjects?: number;
  columns?: Column[];
  hiddenColumns?: Set<string>;
  onPriorityChange?: (priority: Priority | 'all') => void;
  onServiceTypeChange?: (serviceType: ServiceType | 'all') => void;
  onStatusFilterToggle?: (status: ProjectStatus) => void;
  onDateRangeChange?: (range: { start: string | null; end: string | null }) => void;
  onToggleColumn?: (columnId: string) => void;
  onShowAllColumns?: () => void;
  onHideAllColumns?: () => void;
}

const ProjectListLayout: React.FC<ProjectListLayoutProps> = ({
  containerStyle,
  onRefresh,
  onSendEmail,
  onSearch,
  onCreateProject,
  children,
  isTaskView = false,
  selectedPriority,
  selectedServiceType,
  statusFilters,
  searchValue,
  dateRange,
  totalProjects,
  columns,
  hiddenColumns,
  onPriorityChange,
  onServiceTypeChange,
  onStatusFilterToggle,
  onDateRangeChange,
  onToggleColumn,
  onShowAllColumns,
  onHideAllColumns
}) => {
  const header = (
    <ProjectActions 
      selectedPriority={selectedPriority || 'all'}
      selectedServiceType={selectedServiceType || 'all'}
      statusFilters={statusFilters ?? []}
      searchValue={searchValue || ''}
      dateRange={dateRange || { start: null, end: null }}
      totalProjects={totalProjects || 0}
      columns={columns}
      hiddenColumns={hiddenColumns}
      onPriorityChange={onPriorityChange || (() => {})}
      onServiceTypeChange={onServiceTypeChange || (() => {})}
      onStatusFilterToggle={onStatusFilterToggle || (() => {})}
      onDateRangeChange={onDateRangeChange || (() => {})}
      onSearchChange={onSearch}
      onCreateProject={onCreateProject}
      onSendEmail={onSendEmail}
      onToggleColumn={onToggleColumn}
      onShowAllColumns={onShowAllColumns}
      onHideAllColumns={onHideAllColumns}
    />
  );

  const floatingActions = isTaskView ? (
    // Task View: 새 공장과 제품개발의뢰서 편집
    <>
      <FloatingActionButton
        onClick={onCreateProject}
        icon={<FileEdit />}
        label="제품개발의뢰서 편집"
        variant={ButtonVariant.SECONDARY}
        position="second"
      />
      <FloatingActionButton
        onClick={onCreateProject}
        icon={<Factory />}
        label="새 공장"
        variant={ButtonVariant.PRIMARY}
        position="first"
      />
    </>
  ) : (
    // Normal View: 메일 보내기와 새 프로젝트
    <>
      <FloatingActionButton
        onClick={onSendEmail}
        icon={<Mail />}
        label="메일 보내기"
        variant={ButtonVariant.SECONDARY}
        position="second"
      />
      <FloatingActionButton
        onClick={onCreateProject}
        icon={<Plus />}
        label="새 프로젝트"
        variant={ButtonVariant.PRIMARY}
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