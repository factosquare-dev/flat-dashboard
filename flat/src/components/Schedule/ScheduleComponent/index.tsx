import React, { useState, useCallback } from 'react';
import type { ScheduleProps, ViewMode } from './types';
import { useScheduleState } from '../hooks/useScheduleState';
import { useScheduleEffects } from '../hooks/useScheduleEffects';
import { useDynamicLayout } from '../hooks/useDynamicLayout';
import { validateTaskFactoryData } from '../../../utils/scheduleUtils';
import ScheduleLayout from '../components/ScheduleLayout';
import ScheduleGridContainer from '../ScheduleGridContainer';
import ScheduleModals from '../ScheduleModals';
import ScheduleTableView from '../components/ScheduleTableView';
import IntegratedGanttChart from '../components/IntegratedGanttChart';
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
    setViewMode(prevMode => prevMode === 'gantt' ? 'table' : 'gantt');
  }, []);
  
  
  // Data consistency check between Table and Gantt views
  React.useEffect(() => {
    // Validate task-factory data consistency
    const validation = validateTaskFactoryData(taskControls.tasks, projects);
    
    const dataIntegrityCheck = {
      viewMode,
      dataSource: 'taskControls.tasks',
      totalTasks: taskControls.tasks.length,
      taskIds: taskControls.tasks.map(t => t.id).sort(),
      tasksByFactory: taskControls.tasks.reduce((acc, task) => {
        const factory = task.factory || 'Unknown';
        if (!acc[factory]) acc[factory] = 0;
        acc[factory]++;
        return acc;
      }, {} as Record<string, number>),
      validation,
      message: 'Both Table and Gantt views use the same data source (taskControls.tasks)'
    };
    
    // Only log in development mode
    if (import.meta.env.DEV) {
    }
  }, [viewMode, taskControls.tasks, projects]);

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
            onTaskDelete={(taskId) => {
              taskControls.deleteTask(taskId);
            }}
            onTaskCreate={handleAddTask}
            onFactoryDelete={handleDeleteProject}
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