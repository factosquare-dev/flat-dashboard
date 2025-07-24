import React, { useState, useCallback } from 'react';
import type { ScheduleProps, ViewMode } from './types';
import { useScheduleState } from '../hooks/useScheduleState';
import { useScheduleEffects } from '../hooks/useScheduleEffects';
import { useDynamicLayout } from '../hooks/useDynamicLayout';
import ScheduleLayout from '../components/ScheduleLayout';
import ScheduleGridContainer from '../ScheduleGridContainer';
import ScheduleModals from '../ScheduleModals';
import ScheduleTableView from '../components/ScheduleTableView';
import { useToast } from '../../../hooks/useToast';
import { createProjectHandlers, createTaskHandlers, createModalHandlers } from './handlers';

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
  } = useScheduleState(participants, projectStartDate, projectEndDate, gridWidth, initialTasks, projectId);

  const { scrollToToday, handleSliderChange } = useScheduleEffects(
    dateRange.days,
    dragControls.scrollRef,
    sliderValue,
    setSliderValue
  );

  const { handleDeleteProject, handleAddFactory } = createProjectHandlers(
    projects,
    setProjects,
    taskControls
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

  const handleToggleTableView = () => {
    setViewMode(prevMode => prevMode === 'gantt' ? 'table' : 'gantt');
  };

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
        {viewMode === 'gantt' ? (
          <ScheduleGridContainer
            projects={projects}
            tasks={taskControls.tasks}
            days={dateRange.days}
            cellWidth={dateRange.cellWidth}
            scrollRef={dragControls.scrollRef}
            taskControls={taskControls}
            dragControls={dragControls}
            modalState={modalState}
            setModalState={setModalState}
            selectedProjects={selectedProjects}
            setProjects={setProjects}
            onDeleteProject={handleDeleteProject}
            onProjectSelect={handleProjectSelect}
            onSelectAll={handleSelectAll}
            onAddFactory={() => setModalState((prev: any) => ({ ...prev, showFactoryModal: true }))}
            onTaskCreate={handleQuickTaskCreate}
            onGridWidthChange={handleGridWidthChange}
          />
        ) : (
          <ScheduleTableView
            projects={projects}
            tasks={taskControls.tasks}
            onTaskClick={(task) => {
              setModalState((prev: any) => ({ 
                ...prev, 
                showTaskEditModal: true, 
                selectedTask: task 
              }));
            }}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </ScheduleLayout>
      
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

export default Schedule;