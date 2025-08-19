import React from 'react';
import { Mail, FileEdit, Plus } from 'lucide-react';
import { PageLayout, FloatingActionButton } from '@/components/common';
import ScheduleHeader from '@/components/ScheduleHeader';
import { ButtonVariant } from '@/types/enums';

interface ScheduleLayoutProps {
  containerStyle: { top: string; left: string };
  children: React.ReactNode;
  onAddProject: () => void;
  onOpenWorkflow: () => void;
  onOpenEmail: () => void;
  onBack?: () => void;
  onAddTask: () => void;
  onAddFactory?: () => void;
  projectName?: string;
  onToggleTableView?: () => void;
  isTableView?: boolean;
}

const ScheduleLayout: React.FC<ScheduleLayoutProps> = ({
  containerStyle,
  children,
  onAddProject,
  onOpenWorkflow,
  onOpenEmail,
  onBack,
  onAddTask,
  onAddFactory,
  projectName,
  onToggleTableView,
  isTableView
}) => {
  const header = (
    <ScheduleHeader
      onAddProject={onAddProject}
      onOpenWorkflow={onOpenWorkflow}
      onOpenEmail={onOpenEmail}
      onBack={onBack}
      projectName={projectName}
      onToggleTableView={onToggleTableView}
      isTableView={isTableView}
    />
  );

  const floatingActions = isTableView ? (
    // Table View: 새 공장과 제품개발의뢰서 편집
    <>
      <FloatingActionButton
        onClick={onAddProject}
        icon={<FileEdit />}
        label="제품개발의뢰서 편집"
        variant={ButtonVariant.SECONDARY}
        position="second"
      />
      <FloatingActionButton
        onClick={onAddFactory || onAddProject}
        icon={<Plus />}
        label="새 공장"
        variant={ButtonVariant.PRIMARY}
        position="first"
      />
    </>
  ) : (
    // Gantt View: 기존 버튼들
    <>
      <FloatingActionButton
        onClick={onAddProject}
        icon={<FileEdit />}
        label="의뢰서 편집"
        variant={ButtonVariant.SECONDARY}
        position="third"
      />
      <FloatingActionButton
        onClick={onOpenEmail}
        icon={<Mail />}
        label="메일"
        variant={ButtonVariant.SECONDARY}
        position="second"
      />
      <FloatingActionButton
        onClick={onAddTask}
        icon={<Plus />}
        label="태스크 추가"
        variant={ButtonVariant.PRIMARY}
        position="first"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('text/plain', 'new-task');
        }}
        onDragEnd={() => {}}
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

export default ScheduleLayout;