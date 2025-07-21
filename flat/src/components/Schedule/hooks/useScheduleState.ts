import { useState } from 'react';
import type { Participant, Task } from '../../../types/schedule';
import { getDaysArray, formatDate } from '../../../utils/dateUtils';
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
    // 프로젝트 날짜가 제공된 경우, 앞뒤로 4일씩 여유 추가
    startDate = new Date(projectStartDate);
    startDate.setDate(startDate.getDate() - 4);
    
    endDate = new Date(projectEndDate);
    endDate.setDate(endDate.getDate() + 4);
  } else {
    // 날짜가 제공되지 않은 경우 기본값 사용 - 더 긴 기간으로 설정
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 30);
    
    endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 6);
  }

  const days = getDaysArray(startDate, endDate);
  
  // cellWidth를 고정값으로 설정
  const cellWidth = 50; // 고정 너비로 설정하여 스크롤 보장

  const dateRange: DateRange = {
    startDate,
    endDate,
    days,
    cellWidth
  };

  // 색상 배열 정의 (실제 색상 값)
  const colors = [
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
  ];

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
  const taskControls = useScheduleTasks(projects, startDate, endDate, initialTasks);

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