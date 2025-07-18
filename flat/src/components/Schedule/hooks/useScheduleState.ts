import { useState } from 'react';
import type { Participant, Task } from '../../../types/schedule';
import { getDaysArray, formatDate } from '../../../utils/dateUtils';
import { useScheduleDrag } from '../../../hooks/useScheduleDrag';
import { useScheduleTasks } from '../../../hooks/useScheduleTasks';

interface ModalState {
  showEmailModal: boolean;
  showWorkflowModal: boolean;
  showTaskEditModal: boolean;
  showProductRequestModal: boolean;
  selectedTask: Task | null;
  selectedFactories: string[];
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
  projectEndDate: string
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = projectStartDate ? new Date(projectStartDate) : new Date(today);
  if (!projectStartDate) {
    startDate.setDate(startDate.getDate() - 7);
  }
  
  const endDate = projectEndDate ? new Date(projectEndDate) : new Date(today);
  if (!projectEndDate) {
    endDate.setMonth(endDate.getMonth() + 3);
  } else {
    endDate.setDate(endDate.getDate() + 30);
  }

  const cellWidth = 40;
  const days = getDaysArray(startDate, endDate);

  const dateRange: DateRange = {
    startDate,
    endDate,
    days,
    cellWidth
  };

  const initialProjects = participants && participants.length > 0 ? participants : [
    {
      id: 'project-1',
      name: "큐셀시스템",
      period: `${formatDate(today)} ~ ${formatDate(new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000))}`,
      color: "bg-blue-500",
    },
    {
      id: 'project-2',
      name: "(주)연우",
      period: `${formatDate(new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000))} ~ ${formatDate(new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000))}`, 
      color: "bg-red-500",
    },
    {
      id: 'project-3',
      name: "(주)네트모베이지",
      period: `${formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000))} ~ ${formatDate(new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000))}`,
      color: "bg-yellow-500", 
    },
    {
      id: 'project-4',
      name: "주식회사 코스모로스",
      period: `${formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000))} ~ ${formatDate(new Date(today.getTime() + 75 * 24 * 60 * 60 * 1000))}`,
      color: "bg-cyan-500",
    }
  ];

  const [projects, setProjects] = useState<Participant[]>(initialProjects);
  const [sliderValue, setSliderValue] = useState(0);
  
  const [modalState, setModalState] = useState<ModalState>({
    showEmailModal: false,
    showWorkflowModal: false,
    showTaskEditModal: false,
    showProductRequestModal: false,
    selectedTask: null,
    selectedFactories: [],
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
  const taskControls = useScheduleTasks(projects, startDate, endDate);

  return {
    dateRange,
    projects,
    setProjects,
    tasks: taskControls.tasks,
    taskControls,
    dragControls,
    modalState,
    setModalState,
    sliderValue,
    setSliderValue
  };
};