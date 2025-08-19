import { useState, useMemo, useEffect } from 'react';
import type { ScheduleFactory, Task } from '@/types/schedule';
import type { Factory } from '@/types/factory';
import { getDaysArray } from '@/utils/scheduleUtils';
import { formatDate } from '@/utils/coreUtils';
import { useScheduleDrag } from '@/hooks/useScheduleDrag';
import { useScheduleTasks } from '@/hooks/useScheduleTasks';
import { useScheduleTasksWithStore } from '@/hooks/useScheduleTasksWithStore';
import { factories } from '@/data/factories';
import { storageKeys } from '@/config';
import { parseScheduleDate } from '@/utils/scheduleDateParsing';
import { addDays, startOfDay } from 'date-fns';
import { getParticipantColor } from '@/utils/scheduleColorManager';
import { useProjectFactories } from '@/hooks/useProjectFactories';

interface ModalState {
  showEmailModal: boolean;
  showWorkflowModal: boolean;
  showTaskEditModal: boolean;
  showProductRequestModal: boolean;
  showTaskModal: boolean;
  showFactoryModal: boolean;
  selectedTask: Task | null;
  selectedFactories: string[];
  selectedFactoryId: string | null;
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
  participants: Factory[],
  projectStartDate: string,
  projectEndDate: string,
  gridWidth: number,
  initialTasks?: Task[],
  projectId?: string
) => {
  
  const today = startOfDay(new Date());
  
  // 프로젝트 날짜 범위 찾기 (전달받은 날짜가 없는 경우 MockDB에서 가져옴)
  const projectDateRange = useMemo(() => {
    // 먼저 전달받은 날짜가 있으면 사용 (Master/Sub 모두 해당)
    if (projectStartDate && projectEndDate) {
      return { startDate: projectStartDate, endDate: projectEndDate };
    }
    
    if (!projectId) {
      return { startDate: projectStartDate, endDate: projectEndDate };
    }

    try {
      // MockDB에서 프로젝트 정보 가져오기
      const database = JSON.parse(localStorage.getItem(storageKeys.mockDbKey) || '{}');
      const projects = database.projects || {};
      
      interface ProjectData {
        startDate: string;
        endDate: string;
      }
      
      let targetProject: ProjectData | null = null;
      for (const [id, project] of Object.entries(projects)) {
        if (id === projectId) {
          targetProject = project as ProjectData;
          break;
        }
      }

      if (targetProject) {
        // Master든 Sub든 현재 프로젝트의 날짜를 사용
        return {
          startDate: targetProject.startDate,
          endDate: targetProject.endDate
        };
      }
    } catch {
      // Error getting project dates
    }

    return { startDate: projectStartDate, endDate: projectEndDate };
  }, [projectId, projectStartDate, projectEndDate]);
  
  // 간트차트 크기를 프로젝트 기간 기준으로 계산
  let startDate: Date;
  let endDate: Date;
  
  // Use unified date parsing
  const parseLocalDate = parseScheduleDate;
  
  
  if (projectDateRange.startDate && projectDateRange.endDate) {
    // Use local date parsing to avoid timezone issues
    const projectStart = parseLocalDate(projectDateRange.startDate);
    const projectEnd = parseLocalDate(projectDateRange.endDate);
    
    // 패딩 제거 - 프로젝트 날짜와 그리드 날짜를 동일하게 설정
    startDate = startOfDay(projectStart);
    endDate = startOfDay(projectEnd);
    
    
  } else {
    // 프로젝트 날짜가 없는 경우 전달받은 프로젝트 날짜 사용
    if (projectStartDate && projectEndDate) {
      const projectStart = parseLocalDate(projectStartDate);
      const projectEnd = parseLocalDate(projectEndDate);
      
      // 패딩 제거 - 프로젝트 날짜와 그리드 날짜를 동일하게 설정
      startDate = startOfDay(projectStart);
      endDate = startOfDay(projectEnd);
    } else {
      // 정말로 날짜가 없는 경우만 현재 날짜 사용
      // Use date-fns for date calculations
      startDate = startOfDay(addDays(today, -30)); // 1 month before
      endDate = startOfDay(addDays(today, 60)); // 2 months after
    }
  }

  // Memoize days calculation to avoid unnecessary recalculation
  const days = useMemo(() => getDaysArray(startDate, endDate), [startDate, endDate]);
  
  // 일관된 사용자 경험을 위한 고정 셀 크기
  const cellWidth = 50; // 모든 프로젝트에서 동일한 셀 크기 유지

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

  // Get project factories using custom hook
  const projectFactoriesFromDB = useProjectFactories(projectId);

  // Project의 factory ID들을 기반으로 공장 목록 생성
  const getProjectFactories = () => {
    // Use factories from custom hook if available
    if (projectFactoriesFromDB.length > 0) {
      return projectFactoriesFromDB;
    }

    // projectId가 없으면 participants 사용 (하위 호환성)
    if (participants && participants.length > 0) {
      return participants;
    }

    // 둘 다 없으면 빈 배열 반환
    return [];
  };

  const participantsList = useMemo(() => getProjectFactories(), [participants, projectId, projectFactoriesFromDB]);
  
  // "공장 추가" 행을 마지막에 추가 (항상 표시)
  const initialProjects = useMemo(() => {
    // 중복 제거 (ID 기준)
    const uniqueParticipants = participantsList.filter((participant, index, self) => 
      index === self.findIndex(p => p.id === participant.id)
    );
    
    return [
      ...uniqueParticipants,
      {
        id: 'ADD_FACTORY_ROW',
        name: '공장 추가',
        type: 'ADD_FACTORY',
        period: '',
        color: ''
      }
    ];
  }, [participantsList]);

  const [projects, setProjects] = useState<ScheduleFactory[]>(initialProjects);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  
  // participantsList가 변경되면 projects도 업데이트
  useEffect(() => {
    // 중복 제거 (ID 기준)
    const uniqueParticipants = participantsList.filter((participant, index, self) => 
      index === self.findIndex(p => p.id === participant.id)
    );
    
    setProjects([
      ...uniqueParticipants,
      {
        id: 'ADD_FACTORY_ROW',
        name: '공장 추가',
        type: 'ADD_FACTORY',
        period: '',
        color: ''
      }
    ]);
  }, [participantsList]);
  
  const [modalState, setModalState] = useState<ModalState>({
    showEmailModal: false,
    showWorkflowModal: false,
    showTaskEditModal: false,
    showProductRequestModal: false,
    showTaskModal: false,
    showFactoryModal: false,
    selectedTask: null,
    selectedFactories: [],
    selectedFactoryId: null,
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
  
  // Use store-based task controls if projectId is provided
  const storeTaskControls = useScheduleTasksWithStore(projects, startDate, endDate, projectId, cellWidth, days);
  const localTaskControls = useScheduleTasks(projects, startDate, endDate, initialTasks, cellWidth, days);
  
  // Use store controls if projectId exists, otherwise use local controls
  const taskControls = projectId ? storeTaskControls : localTaskControls;

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