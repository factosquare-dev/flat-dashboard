import React, { useState, useCallback } from 'react';
import type { Participant, Task } from '../../types/schedule';
import { useScheduleState } from './hooks/useScheduleState';
import { useScheduleEffects } from './hooks/useScheduleEffects';
import { useDynamicLayout } from './hooks/useDynamicLayout';
import ScheduleLayout from './components/ScheduleLayout';
import ScheduleGridContainer from './ScheduleGridContainer';
import ScheduleModals from './ScheduleModals';
import ScheduleTableView from './components/ScheduleTableView';
import { factories, taskTypesByFactoryType } from '../../data/factories';
import { findAvailableDateRange } from '../../utils/taskUtils';

interface ScheduleProps {
  participants: Participant[];
  tasks?: Task[];
  startDate: string;
  endDate: string;
  projectName?: string;
  className?: string;
  onBack?: () => void;
  isLoading?: boolean;
}

const Schedule: React.FC<ScheduleProps> = ({
  participants,
  tasks: initialTasks,
  startDate: projectStartDate,
  endDate: projectEndDate,
  projectName,
  className = '',
  onBack,
  isLoading = false
}) => {
  const [gridWidth, setGridWidth] = useState(0);
  const [viewMode, setViewMode] = useState<'gantt' | 'table'>('table');
  const { containerStyle, debugInfo } = useDynamicLayout();

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
  } = useScheduleState(participants, projectStartDate, projectEndDate, gridWidth, initialTasks);

  const { scrollToToday, handleSliderChange } = useScheduleEffects(
    dateRange.days,
    dragControls.scrollRef,
    sliderValue,
    setSliderValue
  );

  const handleDeleteProject = (projectId: string) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      setProjects(projects.filter(p => p.id !== projectId));
      taskControls.setTasks(taskControls.tasks.filter(t => t.projectId !== projectId));
    }
  };

  const handleTaskSave = async (updatedTask: Task) => {
    if (modalState.selectedTask) {
      try {
        await taskControls.updateTask(modalState.selectedTask.id, updatedTask);
        setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
      } catch (error) {
        console.error('[Schedule] Failed to update task:', error);
        // Keep modal open on error
        alert('태스크 업데이트 중 오류가 발생했습니다.');
      }
    }
  };

  const handleTaskDelete = () => {
    if (modalState.selectedTask) {
      taskControls.deleteTask(modalState.selectedTask.id);
      setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
    }
  };

  const handleQuickTaskCreate = (taskData: { projectId: string; factory: string; startDate: string; endDate: string }) => {
    const factory = factories.find(f => f.name === taskData.factory);
    const defaultTaskType = factory ? taskTypesByFactoryType[factory.type]?.[0] || '태스크' : '태스크';
    
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      taskData.projectId,
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: taskData.projectId,
      title: defaultTaskType,
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory
    });
  };
  
  const handleTaskCreate = (taskData: { factory: string; taskType: string; startDate: string; endDate: string }) => {
    const projectId = modalState.selectedProjectId || projects[0]?.id || '';
    const project = projects.find(p => p.id === projectId);
    
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      projectId,
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: projectId,
      title: taskData.taskType,
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory
    });
    
    setModalState(prev => ({ ...prev, showTaskModal: false, selectedProjectId: null, selectedDate: null }));
  };

  const handleAddProject = () => {
    setModalState(prev => ({ ...prev, showProductRequestModal: true }));
  };

  const handleOpenWorkflow = () => {
    setModalState(prev => ({ ...prev, showWorkflowModal: true }));
  };

  const handleOpenEmail = () => {
    const selectedFactories = selectedProjects.length > 0 
      ? projects.filter(p => selectedProjects.includes(p.id)).map(p => p.name)
      : []; // 선택된 것이 없으면 빈 배열로 설정
    setModalState(prev => ({ 
      ...prev, 
      showEmailModal: true, 
      selectedFactories 
    }));
  };

  const handleAddTask = () => {
    setModalState(prev => ({ ...prev, showTaskModal: true }));
  };

  const handleToggleTableView = () => {
    setViewMode(prevMode => prevMode === 'gantt' ? 'table' : 'gantt');
  };

  const handleAddFactory = (factory: { id: string; name: string; type: string }) => {
    // 이미 존재하지 않는 경우에만 추가
    if (!projects.find(p => p.id === factory.id)) {
      // 색상 배열 정의 (더 세련된 색상)
      const colors = [
        "#3B82F6", // 블루 (신뢰감)
        "#10B981", // 에메랄드 (성장)
        "#8B5CF6", // 바이올렛 (창의성)
        "#F59E0B", // 앰버 (따뜻함)
        "#EC4899", // 핑크 (혁신)
        "#14B8A6", // 틸 (차분함)
        "#6366F1", // 인디고 (전문성)
        "#84CC16", // 라임 (신선함)
        "#F97316", // 오렌지 (활력)
        "#06B6D4"  // 시안 (기술)
      ];
      
      // 현재 사용중인 색상들 찾기
      const usedColors = projects.map(p => p.color);
      
      // 사용되지 않은 첫 번째 색상 찾기
      const availableColor = colors.find(color => !usedColors.includes(color)) || colors[projects.length % colors.length];
      
      const newProject: Participant = {
        id: factory.id,
        name: factory.name,
        type: factory.type,
        period: '',
        color: availableColor
      };
      
      setProjects(prev => [...prev, newProject]);
    }
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
            onAddFactory={() => setModalState(prev => ({ ...prev, showFactoryModal: true }))}
            onTaskCreate={handleQuickTaskCreate}
            onGridWidthChange={handleGridWidthChange}
          />
        ) : (
          <ScheduleTableView
            projects={projects}
            tasks={taskControls.tasks}
            onTaskClick={(task) => {
              setModalState(prev => ({ 
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