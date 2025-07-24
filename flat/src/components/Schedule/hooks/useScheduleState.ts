import { useState, useMemo } from 'react';
import type { Participant, Task } from '../../../types/schedule';
import { getDaysArray } from '../../../utils/dateUtils';
import { formatDate } from '../../../utils/formatUtils';
import { useScheduleDrag } from '../../../hooks/useScheduleDrag';
import { useScheduleTasks } from '../../../hooks/useScheduleTasks';
import { factories } from '../../../data/factories';

interface ModalState {
  showEmailModal: boolean;
  showWorkflowModal: boolean;
  showTaskEditModal: boolean;
  showProductRequestModal: boolean;
  showTaskModal: boolean;
  showFactoryModal: boolean;
  selectedTask: Task | null;
  selectedFactories: string[];
  selectedProjectId: string | null;
  selectedDate: string | null;
  selectedFactory: string | null;
  hoveredTaskId: number | null;
  draggedProjectIndex: number | null;
  dragOverProjectIndex: number | null;
  isDraggingTask: boolean;
  draggedTask: Task | null;
  isResizingTask: boolean;
  resizeDirection: 'start' | 'end' | null;
  resizingTask: Task | null;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
  days: Date[];
  cellWidth: number;
}

export const useScheduleState = (
  participants: Participant[],
  projectStartDate: string,
  projectEndDate: string,
  gridWidth: number,
  initialTasks?: Task[]
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 프로젝트 시작일과 종료일 설정
  let startDate: Date;
  let endDate: Date;
  
  if (projectStartDate && projectEndDate) {
    // 프로젝트 기간에 따라 동적 패딩 계산 (no more magic numbers!)
    const projectStart = new Date(projectStartDate);
    const projectEnd = new Date(projectEndDate);
    
    // 프로젝트 기간 계산
    const projectDuration = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // 동적 패딩: 프로젝트 기간의 10% (최소 2일, 최대 14일)
    const dynamicPadding = Math.max(2, Math.min(14, Math.ceil(projectDuration * 0.1)));
    
    console.log(`[Schedule] 📅 Project duration: ${projectDuration} days, padding: ${dynamicPadding} days`);
    
    startDate = new Date(projectStart.getTime());
    startDate.setDate(startDate.getDate() - dynamicPadding);
    
    endDate = new Date(projectEnd.getTime());
    endDate.setDate(endDate.getDate() + dynamicPadding);
  } else {
    // 프로젝트 날짜가 없는 경우 기본 범위 (3개월)
    startDate = new Date(today.getTime());
    startDate.setDate(startDate.getDate() - 14);
    
    endDate = new Date(today.getTime());
    endDate.setMonth(endDate.getMonth() + 3);
  }

  // Memoize days calculation to avoid unnecessary recalculation
  const days = useMemo(() => getDaysArray(startDate, endDate), [startDate, endDate]);
  
  // 일관된 사용자 경험을 위한 고정 셀 크기
  const cellWidth = 50; // 모든 프로젝트에서 동일한 셀 크기 유지
  
  console.log(`[Schedule] 📅 Total days: ${days.length}, cellWidth: ${cellWidth}px (fixed for consistent UX)`);

  const dateRange: DateRange = {
    startDate,
    endDate,
    days,
    cellWidth
  };

  // 색상 배열 정의 (실제 색상 값) - useMemo로 최적화
  const colors = useMemo(() => [
    "#3b82f6", // blue-500
    "#ef4444", // red-500
    "#22c55e", // green-500
    "#eab308", // yellow-500
    "#a855f7", // purple-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
    "#f97316", // orange-500
    "#14b8a6", // teal-500
    "#06b6d4"  // cyan-500
  ], []);

  // 공장 데이터를 기반으로 초기 프로젝트 생성
  const initialProjects = participants && participants.length > 0 ? participants : 
    factories.slice(0, 10).map((factory, index) => ({
      id: factory.id,
      name: factory.name,
      type: factory.type,
      period: `${formatDate(new Date(today.getTime() + (index - 5) * 7 * 24 * 60 * 60 * 1000))} ~ ${formatDate(new Date(today.getTime() + ((index - 5) * 7 + 30 + index * 10) * 24 * 60 * 60 * 1000))}`,
      color: colors[index % colors.length],
    }));

  const [projects, setProjects] = useState<Participant[]>(initialProjects);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  
  const [modalState, setModalState] = useState<ModalState>({
    showEmailModal: false,
    showWorkflowModal: false,
    showTaskEditModal: false,
    showProductRequestModal: false,
    showTaskModal: false,
    showFactoryModal: false,
    selectedTask: null,
    selectedFactories: [],
    selectedProjectId: null,
    selectedDate: null,
    selectedFactory: null,
    hoveredTaskId: null,
    draggedProjectIndex: null,
    dragOverProjectIndex: null,
    isDraggingTask: false,
    draggedTask: null,
    isResizingTask: false,
    resizeDirection: null,
    resizingTask: null
  });

  const dragControls = useScheduleDrag();
  const taskControls = useScheduleTasks(projects, startDate, endDate, initialTasks, cellWidth);

  const handleProjectSelect = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects(prev => [...prev, projectId]);
    } else {
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(projects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  return {
    dateRange,
    projects,
    setProjects,
    selectedProjects,
    tasks: taskControls.tasks,
    taskControls,
    dragControls,
    modalState,
    setModalState,
    sliderValue,
    setSliderValue,
    handleProjectSelect,
    handleSelectAll
  };
};