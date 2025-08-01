import type { Task, Schedule } from '../types/schedule';

// 태스크 스케줄링 제약사항
export const TASK_CONSTRAINTS = {
  // 같은 공장에서는 동시에 하나의 태스크만 진행 가능
  MAX_CONCURRENT_TASKS_PER_FACTORY: 1,
  
  // 태스크 간 최소 간격 (일 단위)
  MIN_GAP_BETWEEN_TASKS: 0,
  
  // 태스크 길이 제한
  MIN_TASK_DURATION_DAYS: 1,
  MAX_TASK_DURATION_DAYS: 30,
  
  // 프로젝트 기간 내에서만 태스크 가능
  TASKS_MUST_BE_WITHIN_PROJECT_DATES: true,
} as const;

// 날짜 유틸리티 함수들
export const dateUtils = {
  // 문자열을 Date 객체로 변환
  parseDate: (dateStr: string): Date => {
    return new Date(dateStr + 'T00:00:00');
  },
  
  // Date 객체를 ISO 날짜 문자열로 변환
  formatDate: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },
  
  // 두 날짜 간의 일수 차이 계산
  getDaysBetween: (startDate: string, endDate: string): number => {
    const start = dateUtils.parseDate(startDate);
    const end = dateUtils.parseDate(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 시작일 포함
  },
  
  // 날짜 범위가 겹치는지 확인
  dateRangesOverlap: (
    start1: string, 
    end1: string, 
    start2: string, 
    end2: string
  ): boolean => {
    const s1 = dateUtils.parseDate(start1);
    const e1 = dateUtils.parseDate(end1);
    const s2 = dateUtils.parseDate(start2);
    const e2 = dateUtils.parseDate(end2);
    
    return s1 <= e2 && s2 <= e1;
  },
  
  // 날짜가 범위 내에 있는지 확인
  isDateInRange: (date: string, rangeStart: string, rangeEnd: string): boolean => {
    const d = dateUtils.parseDate(date);
    const start = dateUtils.parseDate(rangeStart);
    const end = dateUtils.parseDate(rangeEnd);
    
    return d >= start && d <= end;
  }
};

// 태스크 유효성 검증 결과 타입
export interface TaskValidationError {
  type: 'OVERLAP' | 'DURATION' | 'PROJECT_BOUNDS' | 'INVALID_DATES';
  message: string;
  conflictingTaskId?: number;
}

export interface TaskValidationResult {
  isValid: boolean;
  errors: TaskValidationError[];
}

// 개별 태스크 검증
export const validateTask = (
  task: Task, 
  projectStartDate?: string, 
  projectEndDate?: string
): TaskValidationResult => {
  const errors: TaskValidationError[] = [];
  
  // 1. 날짜 유효성 검증
  const startDate = dateUtils.parseDate(task.startDate);
  const endDate = dateUtils.parseDate(task.endDate);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    errors.push({
      type: 'INVALID_DATES',
      message: '태스크 날짜가 유효하지 않습니다.'
    });
    return { isValid: false, errors };
  }
  
  if (startDate > endDate) {
    errors.push({
      type: 'INVALID_DATES',
      message: '시작일이 종료일보다 늦습니다.'
    });
  }
  
  // 2. 태스크 기간 검증
  const duration = dateUtils.getDaysBetween(task.startDate, task.endDate);
  if (duration < TASK_CONSTRAINTS.MIN_TASK_DURATION_DAYS) {
    errors.push({
      type: 'DURATION',
      message: `태스크 기간이 최소 ${TASK_CONSTRAINTS.MIN_TASK_DURATION_DAYS}일보다 짧습니다.`
    });
  }
  
  if (duration > TASK_CONSTRAINTS.MAX_TASK_DURATION_DAYS) {
    errors.push({
      type: 'DURATION',
      message: `태스크 기간이 최대 ${TASK_CONSTRAINTS.MAX_TASK_DURATION_DAYS}일을 초과합니다.`
    });
  }
  
  // 3. 프로젝트 기간 내 검증
  if (TASK_CONSTRAINTS.TASKS_MUST_BE_WITHIN_PROJECT_DATES && projectStartDate && projectEndDate) {
    if (!dateUtils.isDateInRange(task.startDate, projectStartDate, projectEndDate)) {
      errors.push({
        type: 'PROJECT_BOUNDS',
        message: '태스크 시작일이 프로젝트 기간을 벗어납니다.'
      });
    }
    
    if (!dateUtils.isDateInRange(task.endDate, projectStartDate, projectEndDate)) {
      errors.push({
        type: 'PROJECT_BOUNDS',
        message: '태스크 종료일이 프로젝트 기간을 벗어납니다.'
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 공장별 태스크 겹침 검증
export const validateFactoryTaskOverlaps = (tasks: Task[]): TaskValidationResult => {
  const errors: TaskValidationError[] = [];
  
  // 공장별로 태스크 그룹화
  const tasksByFactory = tasks.reduce((acc, task) => {
    if (!acc[task.factory]) {
      acc[task.factory] = [];
    }
    acc[task.factory].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // 각 공장별로 겹침 검증
  Object.entries(tasksByFactory).forEach(([factory, factoryTasks]) => {
    // 날짜순으로 정렬
    const sortedTasks = factoryTasks.sort((a, b) => 
      dateUtils.parseDate(a.startDate).getTime() - dateUtils.parseDate(b.startDate).getTime()
    );
    
    // 인접한 태스크들 간 겹침 확인
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const currentTask = sortedTasks[i];
      const nextTask = sortedTasks[i + 1];
      
      if (dateUtils.dateRangesOverlap(
        currentTask.startDate, 
        currentTask.endDate,
        nextTask.startDate, 
        nextTask.endDate
      )) {
        errors.push({
          type: 'OVERLAP',
          message: `${factory}에서 태스크 "${currentTask.taskType}"과 "${nextTask.taskType}"이 겹칩니다.`,
          conflictingTaskId: nextTask.id
        });
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 전체 스케줄 검증
export const validateSchedule = (schedule: Schedule): TaskValidationResult => {
  const allErrors: TaskValidationError[] = [];
  
  // 1. 각 태스크 개별 검증
  schedule.tasks.forEach(task => {
    const result = validateTask(task, schedule.startDate, schedule.endDate);
    allErrors.push(...result.errors);
  });
  
  // 2. 공장별 겹침 검증
  const overlapResult = validateFactoryTaskOverlaps(schedule.tasks);
  allErrors.push(...overlapResult.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// 태스크 생성 시 자동 스케줄링 헬퍼
export const suggestTaskScheduling = (
  newTask: Omit<Task, 'startDate' | 'endDate'>,
  existingTasks: Task[],
  projectStartDate: string,
  projectEndDate: string,
  desiredDuration: number = 3
): { startDate: string; endDate: string } | null => {
  
  // 같은 공장의 기존 태스크들
  const factoryTasks = existingTasks
    .filter(task => task.factory === newTask.factory)
    .sort((a, b) => dateUtils.parseDate(a.startDate).getTime() - dateUtils.parseDate(b.startDate).getTime());
  
  const projectStart = dateUtils.parseDate(projectStartDate);
  const projectEnd = dateUtils.parseDate(projectEndDate);
  
  // 첫 번째 사용 가능한 슬롯 찾기
  const searchDate = new Date(projectStart);
  
  while (searchDate <= projectEnd) {
    const searchStartStr = dateUtils.formatDate(searchDate);
    const searchEndDate = new Date(searchDate);
    searchEndDate.setDate(searchEndDate.getDate() + desiredDuration - 1);
    const searchEndStr = dateUtils.formatDate(searchEndDate);
    
    // 프로젝트 기간을 벗어나면 중단
    if (searchEndDate > projectEnd) {
      break;
    }
    
    // 기존 태스크와 겹치는지 확인
    const hasConflict = factoryTasks.some(task => 
      dateUtils.dateRangesOverlap(
        searchStartStr, 
        searchEndStr,
        task.startDate, 
        task.endDate
      )
    );
    
    if (!hasConflict) {
      return {
        startDate: searchStartStr,
        endDate: searchEndStr
      };
    }
    
    // 다음 날로 이동
    searchDate.setDate(searchDate.getDate() + 1);
  }
  
  return null; // 사용 가능한 슬롯을 찾지 못함
};

// 태스크 이동/수정 시 검증
export const validateTaskModification = (
  modifiedTask: Task,
  otherTasks: Task[],
  schedule: Schedule
): TaskValidationResult => {
  // 수정된 태스크를 포함한 임시 태스크 목록 생성
  const tempTasks = [
    ...otherTasks.filter(task => task.id !== modifiedTask.id),
    modifiedTask
  ];
  
  // 임시 스케줄 생성 후 검증
  const tempSchedule: Schedule = {
    ...schedule,
    tasks: tempTasks
  };
  
  return validateSchedule(tempSchedule);
};