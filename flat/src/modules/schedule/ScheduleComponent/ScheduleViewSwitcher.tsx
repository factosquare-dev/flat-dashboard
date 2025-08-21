import React, { useMemo } from 'react';
import ScheduleGridContainer from '@/shared/components/ScheduleGridContainer';
import ScheduleTableView from '@/shared/components/components/ScheduleTableView';
import TaskCentricGanttChart from '@/shared/components/components/TaskCentricGanttChart';
import type { ViewMode } from './types';
import type { Participant, Task } from '@/shared/types/schedule';
import type { Factory } from '@/shared/types/factory';
import { ViewMode as ViewModeEnum, ProjectType } from '@/shared/types/enums';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';

interface ScheduleViewSwitcherProps {
  viewMode: ViewMode;
  projects: Factory[];  // Should be Factory[] not Participant[]
  tasks: Task[];
  dateRange: {
    days: Date[];
    cellWidth: number;
  };
  projectId?: string;
  selectedProjects: string[];
  taskControls: {
    deleteTask: (taskId: string) => void;
  };
  dragControls: {
    scrollRef: React.RefObject<HTMLElement>;
  };
  modalState: {
    showFactoryModal?: boolean;
    showTaskEditModal?: boolean;
    selectedTask?: Task;
  };
  setModalState: React.Dispatch<React.SetStateAction<{
    showFactoryModal?: boolean;
    showTaskEditModal?: boolean;
    selectedTask?: Task;
  }>>;
  setProjects: React.Dispatch<React.SetStateAction<Participant[]>>;
  onDeleteProject: (projectId: string) => void;
  onProjectSelect: (projectId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onAddTask: () => void;
  onGridWidthChange: (width: number) => void;
  onQuickTaskCreate: (projectId: string, date: string) => void;
}

const ScheduleViewSwitcher: React.FC<ScheduleViewSwitcherProps> = React.memo(({
  viewMode,
  projects,
  tasks,
  dateRange,
  projectId,
  selectedProjects,
  taskControls,
  dragControls,
  modalState,
  setModalState,
  setProjects,
  onDeleteProject,
  onProjectSelect,
  onSelectAll,
  onAddTask,
  onGridWidthChange,
  onQuickTaskCreate,
}) => {
  // Get project type from MockDB
  const projectType = useMemo(() => {
    if (!projectId) return null;
    
    try {
      const db = MockDatabaseImpl.getInstance();
      const project = db.getProjectById(projectId);
      return project?.type || null;
    } catch {
      return null;
    }
  }, [projectId]);

  if (viewMode === ViewModeEnum.GANTT) {
    // Use TaskCentricGanttChart for SUB and INDEPENDENT projects
    if (projectType === ProjectType.SUB || projectType === ProjectType.INDEPENDENT) {
      return (
        <TaskCentricGanttChart
          tasks={tasks}
          onTaskUpdate={(taskId, updates) => {
            // Handle task updates if needed
            console.log('Task update:', taskId, updates);
          }}
        />
      );
    }
    
    // Use existing ScheduleGridContainer for MASTER projects or when type is unknown
    return (
      <ScheduleGridContainer
        projects={projects}
        tasks={tasks}
        days={dateRange.days}
        cellWidth={dateRange.cellWidth}
        scrollRef={dragControls.scrollRef}
        taskControls={taskControls}
        dragControls={dragControls}
        modalState={modalState}
        setModalState={setModalState}
        selectedProjects={selectedProjects}
        setProjects={setProjects}
        onDeleteProject={onDeleteProject}
        onProjectSelect={onProjectSelect}
        onSelectAll={onSelectAll}
        onAddFactory={() => setModalState(prev => ({ ...prev, showFactoryModal: true }))}
        onTaskCreate={onQuickTaskCreate}
        onGridWidthChange={onGridWidthChange}
      />
    );
  }

  return (
    <ScheduleTableView
      projects={projects}
      tasks={tasks}
      projectId={projectId}
      onTaskClick={(task) => {
        setModalState(prev => ({ 
          ...prev, 
          showTaskEditModal: true, 
          selectedTask: task 
        }));
      }}
      onDeleteProject={onDeleteProject}
      onTaskDelete={(taskId) => {
        taskControls.deleteTask(taskId);
      }}
      onTaskCreate={onAddTask}
      onFactoryDelete={onDeleteProject}
    />
  );
});

ScheduleViewSwitcher.displayName = 'ScheduleViewSwitcher';

export default ScheduleViewSwitcher;