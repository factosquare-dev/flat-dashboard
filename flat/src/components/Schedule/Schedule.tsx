import React, { useState } from 'react';
import type { Participant, Task } from '../../types/schedule';
import { getDaysArray, formatDate, isToday } from '../../utils/dateUtils';
import { useScheduleState } from './hooks/useScheduleState';
import { useScheduleEffects } from './hooks/useScheduleEffects';
import ScheduleHeader from './ScheduleHeader';
import ScheduleGridContainer from './ScheduleGridContainer';
import ScrollControls from './ScrollControls';
import ScheduleModals from './ScheduleModals';

interface ScheduleProps {
  participants: Participant[];
  startDate: string;
  endDate: string;
  className?: string;
}

const Schedule: React.FC<ScheduleProps> = ({ 
  participants, 
  startDate: projectStartDate, 
  endDate: projectEndDate,
  className = '' 
}) => {
  const { 
    dateRange, 
    projects, 
    setProjects,
    tasks,
    taskControls,
    dragControls,
    modalState,
    setModalState,
    sliderValue,
    setSliderValue
  } = useScheduleState(participants, projectStartDate, projectEndDate);

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

  const handleTaskSave = (updatedTask: Task) => {
    if (modalState.selectedTask) {
      taskControls.updateTask(modalState.selectedTask.id, updatedTask);
    }
    setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
  };

  const handleTaskDelete = () => {
    if (modalState.selectedTask) {
      taskControls.deleteTask(modalState.selectedTask.id);
      setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
    }
  };

  return (
    <div className={`p-6 bg-gray-100 min-h-screen ${className}`}>
      <ScheduleHeader
        onAddProject={() => setModalState(prev => ({ ...prev, showProductRequestModal: true }))}
        onOpenWorkflow={() => setModalState(prev => ({ ...prev, showWorkflowModal: true }))}
        onOpenEmail={() => setModalState(prev => ({ ...prev, showEmailModal: true }))}
      />

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
        onDeleteProject={handleDeleteProject}
      />

      <ScrollControls
        sliderValue={sliderValue}
        onSliderChange={handleSliderChange}
        onTodayClick={scrollToToday}
      />

      <ScheduleModals
        modalState={modalState}
        setModalState={setModalState}
        projects={projects}
        onTaskSave={handleTaskSave}
        onTaskDelete={handleTaskDelete}
      />
    </div>
  );
};

export default Schedule;