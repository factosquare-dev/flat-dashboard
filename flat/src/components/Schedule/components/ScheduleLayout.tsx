import React from 'react';
import { Mail, FileEdit, Plus } from 'lucide-react';
import { PageLayout, FloatingActionButton } from '../../common';
import ScheduleHeader from '../ScheduleHeader';

interface ScheduleLayoutProps {
  containerStyle: { top: string; left: string };
  children: React.ReactNode;
  onAddProject: () => void;
  onOpenWorkflow: () => void;
  onOpenEmail: () => void;
  onBack?: () => void;
  onAddTask: () => void;
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

  const floatingActions = (
    <>
      <FloatingActionButton
        onClick={onAddProject}
        icon={<FileEdit />}
        label="의뢰서 편집"
        variant="secondary"
        position="third"
      />
      <FloatingActionButton
        onClick={onOpenEmail}
        icon={<Mail />}
        label="메일"
        variant="secondary"
        position="second"
      />
      <FloatingActionButton
        onClick={onAddTask}
        icon={<Plus />}
        label="태스크 추가"
        variant="primary"
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