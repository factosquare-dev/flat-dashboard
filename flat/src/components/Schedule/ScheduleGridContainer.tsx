import React, { useState, useEffect } from 'react';
import type { Participant, Task, DragTooltip, ResizePreview } from '../../types/schedule';
import { getDateFromX } from '../../utils/dateUtils';
import { findAvailableDateRange } from '../../utils/taskUtils';
import ScheduleGrid from './ScheduleGrid';
import { factories } from '../../data/factories';

interface ScheduleGridContainerProps {
  projects: Participant[];
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  taskControls: any;
  dragControls: any;
  modalState: any;
  setModalState: any;
  selectedProjects: string[];
  setProjects: (projects: Participant[]) => void;
  onDeleteProject: (projectId: string) => void;
  onProjectSelect: (projectId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onAddFactory?: () => void;
  onTaskCreate?: (task: { projectId: string; factory: string; startDate: string; endDate: string }) => void;
  onGridWidthChange?: (width: number) => void;
}

interface DragState {
  offsetX: number;
  taskWidth: number;
}

const ScheduleGridContainer: React.FC<ScheduleGridContainerProps> = ({
  projects,
  tasks,
  days,
  cellWidth,
  scrollRef,
  taskControls,
  dragControls,
  modalState,
  setModalState,
  selectedProjects,
  setProjects,
  onDeleteProject,
  onProjectSelect,
  onSelectAll,
  onAddFactory,
  onTaskCreate,
  onGridWidthChange
}) => {
  const [dragTooltip, setDragTooltip] = useState<DragTooltip | null>(null);
  const [resizePreview, setResizePreview] = useState<ResizePreview | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<{ projectId: string; startDate: string; endDate: string } | null>(null);

  // ResizeObserver 일시 비활성화
  // useEffect(() => {
  //   if (scrollRef.current && onGridWidthChange) {
  //     const observer = new ResizeObserver(entries => {
  //       for (let entry of entries) {
  //         if (entry.contentBoxSize) {
  //           const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
  //           onGridWidthChange(contentBoxSize.inlineSize);
  //         } else {
  //           onGridWidthChange(entry.contentRect.width);
  //         }
  //       }
  //     });
  //     observer.observe(scrollRef.current);
  //     return () => observer.disconnect();
  //   }
  // }, [scrollRef, onGridWidthChange]);

  const handleTaskClick = (task: Task) => {
    if (!dragControls.isDragClick()) return;
    setModalState((prev: any) => ({
      ...prev,
      selectedTask: task,
      showTaskEditModal: true
    }));
  };

  const handleGridClick = (e: React.MouseEvent, projectId: string, date: string) => {
    // 태스크 생성 모달 열기 - projectId를 통해 공장 정보 전달
    setModalState((prev: any) => ({
      ...prev,
      showTaskModal: true,
      selectedProjectId: projectId,
      selectedDate: date,
      selectedFactory: projects.find(p => p.id === projectId)?.name || ''
    }));
  };

  const handleTaskDragStart = (e: React.DragEvent, task: Task, index: number) => {
    // 태스크 내에서 클릭한 위치의 오프셋 계산
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const taskWidth = rect.width;
    
    setDragState({ offsetX, taskWidth });
    setModalState((prev: any) => ({
      ...prev,
      isDraggingTask: true,
      draggedTask: task
    }));
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskIndex', index.toString());
    e.dataTransfer.setData('taskId', task.id.toString());
    
    // 커스텀 드래그 이미지 설정
    const dragImage = document.createElement('div');
    dragImage.style.width = '1px';
    dragImage.style.height = '1px';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleTaskDragEnd = () => {
    setModalState((prev: any) => ({
      ...prev,
      isDraggingTask: false,
      draggedTask: null
    }));
    setDragTooltip(null);
    setDragState(null);
    setDragPreview(null);
  };

  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (scrollRef.current && modalState.draggedTask && dragState) {
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragState.offsetX;
      const daysFromStart = Math.floor(x / cellWidth);
      const startDate = new Date(days[0]);
      startDate.setDate(startDate.getDate() + daysFromStart);
      
      // 태스크 기간 계산
      const taskDuration = Math.ceil((new Date(modalState.draggedTask.endDate).getTime() - new Date(modalState.draggedTask.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + taskDuration);
      
      setDragTooltip({
        x: e.clientX,
        y: e.clientY,
        date: `${startDate.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}`
      });
      
      // 드래그 중인 프로젝트 찾기
      const targetElement = e.target as HTMLElement;
      const projectRow = targetElement.closest('[data-project-id]');
      if (projectRow) {
        const projectId = projectRow.getAttribute('data-project-id');
        if (projectId) {
          // 대상 프로젝트의 공장 타입 확인
          const targetProject = projects.find(p => p.id === projectId);
          const draggedTaskFactory = modalState.draggedTask.factory;
          const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
          const targetFactory = factories.find(f => f.name === targetProject?.name);
          
          // 공장 타입이 다르면 프리뷰 표시하지 않음
          if (draggedFactory && targetFactory && draggedFactory.type !== targetFactory.type) {
            setDragPreview(null);
          } else {
            setDragPreview({
              projectId,
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0]
            });
          }
        }
      }
    }
  };

  const handleTaskDrop = (e: React.DragEvent, targetProjectId: string, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    
    if (!isNaN(taskId) && modalState.draggedTask && scrollRef.current && dragState) {
      // 대상 프로젝트의 공장 정보 찾기
      const targetProject = projects.find(p => p.id === targetProjectId);
      const draggedTaskFactory = modalState.draggedTask.factory;
      
      // 공장 타입 확인
      const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
      const targetFactory = factories.find(f => f.name === targetProject?.name);
      
      // 공장 타입이 다르면 이동 불가
      if (draggedFactory && targetFactory && draggedFactory.type !== targetFactory.type) {
        alert(`${draggedFactory.type} 공장의 태스크는 ${targetFactory.type} 공장으로 이동할 수 없습니다.`);
        setDragPreview(null);
        return;
      }
      
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragState.offsetX;
      const daysFromStart = Math.floor(x / cellWidth);
      const newStartDate = new Date(days[0]);
      newStartDate.setDate(newStartDate.getDate() + daysFromStart);
      
      // 태스크 기간 유지
      const taskDuration = Math.ceil((new Date(modalState.draggedTask.endDate).getTime() - new Date(modalState.draggedTask.startDate).getTime()) / (1000 * 60 * 60 * 24));
      
      // 겁치지 않는 날짜 찾기
      const availableRange = findAvailableDateRange(
        targetProjectId,
        newStartDate.toISOString().split('T')[0],
        taskDuration,
        taskControls.tasks,
        taskId
      );
      
      // 태스크 업데이트 (공장 이름도 업데이트)
      taskControls.updateTask(taskId, {
        projectId: targetProjectId,
        factory: targetProject?.name || modalState.draggedTask.factory,
        startDate: availableRange.startDate,
        endDate: availableRange.endDate
      });
    }
    
    setDragPreview(null);
  };

  const handleTaskMouseDown = (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    setModalState((prev: any) => ({
      ...prev,
      isResizingTask: true,
      resizingTask: task,
      resizeDirection: direction
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (modalState.isResizingTask && modalState.resizingTask && modalState.resizeDirection && scrollRef.current) {
      e.preventDefault();
      const rect = scrollRef.current.getBoundingClientRect();
      // 공장 열(264px)을 고려한 정확한 x 위치 계산
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft;
      const daysFromStart = Math.floor(x / cellWidth);
      const newDate = new Date(days[0]);
      newDate.setDate(newDate.getDate() + daysFromStart);
      const dateStr = newDate.toISOString().split('T')[0];
      
      
      // 시작일과 종료일이 서로 바뀌지 않도록 검사
      if (modalState.resizeDirection === 'start') {
        const endDate = new Date(modalState.resizingTask.endDate);
        if (newDate <= endDate) {
          setResizePreview({
            taskId: modalState.resizingTask.id,
            startDate: dateStr,
            endDate: modalState.resizingTask.endDate
          });
        }
      } else {
        const startDate = new Date(modalState.resizingTask.startDate);
        if (newDate >= startDate) {
          setResizePreview({
            taskId: modalState.resizingTask.id,
            startDate: modalState.resizingTask.startDate,
            endDate: dateStr
          });
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (modalState.isResizingTask && modalState.resizingTask && resizePreview) {
      // 리사이즈 시 겁치지 않는 날짜 찾기
      const duration = Math.ceil((new Date(resizePreview.endDate).getTime() - new Date(resizePreview.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const availableRange = findAvailableDateRange(
        modalState.resizingTask.projectId,
        resizePreview.startDate,
        duration,
        taskControls.tasks,
        modalState.resizingTask.id
      );
      
      taskControls.updateTask(modalState.resizingTask.id, {
        startDate: availableRange.startDate,
        endDate: availableRange.endDate
      });
    }
    setModalState((prev: any) => ({
      ...prev,
      isResizingTask: false,
      resizingTask: null,
      resizeDirection: null
    }));
    setResizePreview(null);
  };

  const handleProjectDragStart = (e: React.DragEvent, index: number) => {
    setModalState((prev: any) => ({
      ...prev,
      draggedProjectIndex: index
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProjectDragEnd = () => {
    setModalState((prev: any) => ({
      ...prev,
      draggedProjectIndex: null,
      dragOverProjectIndex: null
    }));
  };

  const handleProjectDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleProjectDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (modalState.draggedProjectIndex !== null && modalState.draggedProjectIndex !== dropIndex) {
      console.log('Project drop not implemented yet');
    }
  };

  return (
    <div className="h-full">
      <ScheduleGrid
      projects={projects}
      tasks={tasks}
      days={days}
      cellWidth={cellWidth}
      scrollRef={scrollRef}
      hoveredTaskId={modalState.hoveredTaskId}
      draggedProjectIndex={modalState.draggedProjectIndex}
      dragOverProjectIndex={modalState.dragOverProjectIndex}
      isDraggingTask={modalState.isDraggingTask}
      dragTooltip={dragTooltip}
      resizePreview={resizePreview}
      dragPreview={dragPreview}
      draggedTask={modalState.draggedTask}
      selectedProjects={selectedProjects}
      modalState={modalState}
      setModalState={setModalState}
      setProjects={setProjects}
      onMouseDown={dragControls.handleMouseDown}
      onMouseMove={modalState.isResizingTask ? handleMouseMove : dragControls.handleMouseMove}
      onMouseUp={modalState.isResizingTask ? handleMouseUp : dragControls.handleMouseUp}
      onTaskClick={handleTaskClick}
      onTaskDragStart={handleTaskDragStart}
      onTaskDragEnd={handleTaskDragEnd}
      onTaskDragOver={handleTaskDragOver}
      onTaskDrop={handleTaskDrop}
      onTaskMouseDown={handleTaskMouseDown}
      onTaskHover={(taskId) => setModalState((prev: any) => ({ ...prev, hoveredTaskId: taskId }))}
      onProjectDragStart={handleProjectDragStart}
      onProjectDragEnd={handleProjectDragEnd}
      onProjectDragOver={handleProjectDragOver}
      onProjectDrop={handleProjectDrop}
      onDeleteProject={onDeleteProject}
      onGridClick={handleGridClick}
      onProjectSelect={onProjectSelect}
      onSelectAll={onSelectAll}
      onAddFactory={onAddFactory}
      onTaskCreate={onTaskCreate}
      onTaskDelete={(taskId) => taskControls.deleteTask(taskId)}
      />
    </div>
  );
};

export default ScheduleGridContainer;