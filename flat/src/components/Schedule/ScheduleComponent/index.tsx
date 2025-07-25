import React, { useState, useCallback, useEffect } from 'react';
import type { ScheduleProps, ViewMode } from './types';
import { useScheduleState } from '../hooks/useScheduleState';
import { useScheduleEffects } from '../hooks/useScheduleEffects';
import { useDynamicLayout } from '../hooks/useDynamicLayout';
import { useTaskStore } from '../../../stores/taskStore';
import ScheduleLayout from '../components/ScheduleLayout';
import ScheduleModals from '../ScheduleModals';
import ScheduleViewSwitcher from './ScheduleViewSwitcher';
import ScheduleDataValidator from './ScheduleDataValidator';
import { useToast } from '../../../hooks/useToast';
import { createProjectHandlers, createTaskHandlers, createModalHandlers } from './handlers';
import { comprehensiveScheduleDebug } from '../../../utils/scheduleComprehensiveDebug';

const Schedule: React.FC<ScheduleProps> = ({
  participants,
  tasks: initialTasks,
  startDate: projectStartDate,
  endDate: projectEndDate,
  projectName,
  projectId,
  className = '',
  onBack,
  isLoading = false
}) => {
  const [gridWidth, setGridWidth] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const { containerStyle, debugInfo } = useDynamicLayout();
  const { error: toastError } = useToast();
  

  const handleGridWidthChange = useCallback((width: number) => {
    setGridWidth(width);
  }, []);

  // Use taskStore for unified data management
  const { getTasksForProject, updateTask, deleteTask, addTask } = useTaskStore();
  const storeTasks = projectId ? getTasksForProject(projectId) : [];
  
  const {
    dateRange,
    projects,
    setProjects,
    selectedProjects,
    tasks,
    taskControls,
    dragControls,
    modalState,
    setModalState,
    sliderValue,
    setSliderValue,
    handleProjectSelect,
    handleSelectAll
  } = useScheduleState(participants, projectStartDate, projectEndDate, gridWidth, storeTasks.length > 0 ? storeTasks : initialTasks, projectId);

  const { scrollToToday, handleSliderChange } = useScheduleEffects(
    dateRange.days,
    dragControls.scrollRef,
    sliderValue,
    setSliderValue
  );

  const { handleDeleteProject, handleAddFactory } = createProjectHandlers(
    projects,
    setProjects,
    taskControls,
    projectId
  );

  const {
    handleTaskSave,
    handleTaskDelete,
    handleQuickTaskCreate,
    handleTaskCreate
  } = createTaskHandlers(
    projects,
    taskControls,
    modalState,
    setModalState,
    toastError
  );

  const {
    handleAddProject,
    handleOpenWorkflow,
    handleOpenEmail,
    handleAddTask
  } = createModalHandlers(
    projects,
    selectedProjects,
    setModalState
  );

  const handleToggleTableView = useCallback(() => {
    setViewMode(prevMode => {
      const newMode = prevMode === 'gantt' ? 'table' : 'gantt';
      return newMode;
    });
  }, []);
  
  // Run date verification when tasks change (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && taskControls.tasks.length > 0 && dateRange.days) {
      comprehensiveScheduleDebug(
        taskControls.tasks, 
        dateRange.days, 
        projects,
        dateRange.cellWidth,
        projectStartDate,
        projectEndDate
      );
    }
  }, [taskControls.tasks, dateRange.days, dateRange.cellWidth, projects, projectStartDate, projectEndDate]);
  
  
  // Render data validator (only in development)
  const dataValidator = <ScheduleDataValidator 
    viewMode={viewMode}
    tasks={taskControls.tasks}
    projects={projects}
  />;

  return (
    <>
      <ScheduleLayout
        containerStyle={containerStyle}
        onAddProject={handleAddProject}
        onOpenWorkflow={handleOpenWorkflow}
        onOpenEmail={handleOpenEmail}
        onBack={onBack}
        onAddTask={handleAddTask}
        projectName={projectName}
        onToggleTableView={handleToggleTableView}
        isTableView={viewMode === 'table'}
      >
        <ScheduleViewSwitcher
          viewMode={viewMode}
          projects={projects}
          tasks={taskControls.tasks}
          dateRange={dateRange}
          projectId={projectId}
          selectedProjects={selectedProjects}
          taskControls={taskControls}
          dragControls={dragControls}
          modalState={modalState}
          setModalState={setModalState}
          setProjects={setProjects}
          onDeleteProject={handleDeleteProject}
          onProjectSelect={handleProjectSelect}
          onSelectAll={handleSelectAll}
          onTaskCreate={handleQuickTaskCreate}
          onAddTask={handleAddTask}
          onGridWidthChange={handleGridWidthChange}
          onQuickTaskCreate={handleQuickTaskCreate}
        />
      </ScheduleLayout>
      
      {dataValidator}
      
      <ScheduleModals
        modalState={modalState}
        setModalState={setModalState}
        projects={projects}
        onTaskSave={handleTaskSave}
        onTaskDelete={handleTaskDelete}
        onTaskCreate={handleTaskCreate}
        onFactoryAdd={handleAddFactory}
      />
    </>
  );
};

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: ScheduleProps, nextProps: ScheduleProps) => {
  // Check if main props changed
  if (prevProps.projectId !== nextProps.projectId ||
      prevProps.projectName !== nextProps.projectName ||
      prevProps.startDate !== nextProps.startDate ||
      prevProps.endDate !== nextProps.endDate ||
      prevProps.className !== nextProps.className ||
      prevProps.isLoading !== nextProps.isLoading) {
    return false;
  }
  
  // Check participants array
  if (prevProps.participants !== nextProps.participants ||
      prevProps.participants.length !== nextProps.participants.length) {
    return false;
  }
  
  // Check tasks array
  if (prevProps.tasks !== nextProps.tasks ||
      prevProps.tasks?.length !== nextProps.tasks?.length) {
    return false;
  }
  
  // Check callback
  if (prevProps.onBack !== nextProps.onBack) {
    return false;
  }
  
  return true;
};

export default React.memo(Schedule, arePropsEqual);