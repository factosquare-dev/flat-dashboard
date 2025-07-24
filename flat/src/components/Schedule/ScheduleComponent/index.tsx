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

  const handleToggleTableView = () => {
    setViewMode(prevMode => prevMode === 'gantt' ? 'table' : 'gantt');
  };
  
  // Debug log for main data
  console.log('[Schedule Component] Main Data:', {
    projects: projects.map(p => ({ id: p.id, name: p.name })),
    totalTasks: taskControls.tasks.length,
    viewMode,
    initialTasks: initialTasks?.length || 0,
    taskFactories: [...new Set(taskControls.tasks.map(t => t.factory))],
    taskSample: taskControls.tasks.slice(0, 5).map(t => ({
      id: t.id,
      factory: t.factory,
      factoryId: t.factoryId,
      projectId: t.projectId,
      title: t.title
    }))
  });
  
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
    
    console.log('[Data Consistency Check]', dataIntegrityCheck);
    
    if (!validation.isValid) {
      console.warn('[Data Validation Issues]', {
        issues: validation.issues,
        summary: validation.summary,
        projects: projects.map(p => ({ id: p.id, name: p.name })),
        remainingTasks: taskControls.tasks.filter(t => {
          const hasMatchingProject = projects.some(p => 
            p.id === t.projectId || 
            p.name === t.factory || 
            p.id === t.factoryId
          );
          return !hasMatchingProject;
        }).map(t => ({
          id: t.id,
          title: t.title,
          factory: t.factory,
          factoryId: t.factoryId,
          projectId: t.projectId
        }))
      });
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