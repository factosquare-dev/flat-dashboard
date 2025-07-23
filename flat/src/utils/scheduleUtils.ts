import type { Task } from '../types/schedule';
import { formatDateISO } from './dateUtils';

/**
 * 오늘 날짜에 걸쳐있는 태스크들을 찾아서 현재 단계를 반환합니다.
 */
export const getCurrentStagesFromTasks = (tasks: Task[]): string[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const todayEndTime = todayEnd.getTime();
  
  
  // 오늘 날짜에 걸쳐있는 태스크 필터링
  const currentTasks = tasks.filter(task => {
    const startTime = new Date(task.startDate).getTime();
    const endTime = new Date(task.endDate).getTime();
    
    // 태스크가 오늘에 걸쳐있는지 확인
    const isInTodayRange = (startTime <= todayEndTime && endTime >= todayTime);
    
    // 진행 중이거나 대기 중인 태스크만 포함 (완료되거나 승인된 것은 제외)
    const isActive = !task.status || task.status === 'in-progress' || task.status === 'pending';
    
    
    // 의존성 체크 - 선행 작업이 있는 경우
    if (task.dependsOn && task.dependsOn.length > 0) {
      // 모든 선행 작업이 완료되었는지 확인
      const allDependenciesCompleted = task.dependsOn.every(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && (depTask.status === 'completed' || depTask.status === 'approved');
      });
      
      // 선행 작업이 완료되지 않았으면 제외
      if (!allDependenciesCompleted) {
        return false;
      }
    }
    
    // 진행중인 태스크만 현재 단계로 표시
    return isInTodayRange && task.status === 'in-progress';
  });
  
  
  // 중복 제거하여 태스크 타입(단계) 반환
  return [...new Set(currentTasks.map(task => task.taskType || task.title || ''))];
};

/**
 * 태스크의 의존성을 확인하고 실행 가능한지 여부를 반환합니다.
 */
export const canTaskStart = (task: Task, allTasks: Task[]): boolean => {
  if (!task.dependsOn || task.dependsOn.length === 0) {
    return true;
  }
  
  return task.dependsOn.every(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask && (depTask.status === 'completed' || depTask.status === 'approved');
  });
};

/**
 * 태스크 상태를 업데이트할 때 의존하는 태스크들의 상태도 업데이트합니다.
 */
export const updateDependentTasks = (completedTaskId: number, allTasks: Task[]): Task[] => {
  return allTasks.map(task => {
    // 이 태스크가 완료된 태스크에 의존하는 경우
    if (task.dependsOn && task.dependsOn.includes(completedTaskId)) {
      // 모든 의존성이 해결되었는지 확인
      if (canTaskStart(task, allTasks)) {
        // 'blocked' 상태였다면 'pending'으로 변경
        if (task.status === 'blocked') {
          return { ...task, status: 'pending' };
        }
      }
    }
    return task;
  });
};

/**
 * 태스크 목록에서 프로젝트 진행률을 계산합니다.
 */
export const calculateProjectProgress = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let completedWeight = 0;
  let totalWeight = 0;
  
  tasks.forEach(task => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const duration = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);
    
    totalWeight += duration;
    
    if (task.status === 'completed') {
      completedWeight += duration;
    } else if (task.status === 'in-progress') {
      // 진행 중인 태스크는 시작일부터 오늘까지의 진행률 계산
      if (today >= startDate && today <= endDate) {
        const elapsed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        const progress = Math.min(1, elapsed / duration);
        completedWeight += duration * progress;
      } else if (today > endDate) {
        // 기한이 지난 진행중 태스크는 90%로 계산
        completedWeight += duration * 0.9;
      }
    }
  });
  
  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
};

/**
 * 전체 프로젝트 진행도를 계산합니다.
 */
export const calculateOverallProgress = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) return 0;
  
  // 방법 1: 단순 평균 (모든 태스크의 진행도 평균)
  const simpleAverage = () => {
    const totalProgress = tasks.reduce((sum, task) => {
      const progress = task.progress || (task.status === 'completed' || task.status === 'approved' ? 100 : 0);
      return sum + progress;
    }, 0);
    return Math.round(totalProgress / tasks.length);
  };
  
  // 방법 2: 기간 가중 평균 (태스크 기간에 따른 가중치)
  const durationWeightedAverage = () => {
    let totalWeightedProgress = 0;
    let totalDuration = 0;
    
    tasks.forEach(task => {
      const duration = Math.max(1, 
        (new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const progress = task.progress || (task.status === 'completed' || task.status === 'approved' ? 100 : 0);
      
      totalWeightedProgress += progress * duration;
      totalDuration += duration;
    });
    
    return totalDuration > 0 ? Math.round(totalWeightedProgress / totalDuration) : 0;
  };
  
  // 방법 3: 완료된 태스크 비율
  const completionRatio = () => {
    const completedTasks = tasks.filter(task => 
      task.status === 'completed' || task.status === 'approved'
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };
  
  // 방법 4: 의존성을 고려한 진행도 (Critical Path 고려)
  const dependencyAwareProgress = () => {
    // 루트 태스크 (의존성이 없는 태스크)부터 시작
    const rootTasks = tasks.filter(task => !task.dependsOn || task.dependsOn.length === 0);
    
    // 각 태스크의 중요도 계산 (해당 태스크에 의존하는 태스크 수)
    const taskImportance = new Map<number, number>();
    tasks.forEach(task => {
      const dependentCount = tasks.filter(t => 
        t.dependsOn && t.dependsOn.includes(task.id)
      ).length;
      taskImportance.set(task.id, dependentCount + 1); // 자기 자신 + 의존하는 태스크들
    });
    
    // 중요도에 따른 가중 평균
    let totalWeightedProgress = 0;
    let totalImportance = 0;
    
    tasks.forEach(task => {
      const importance = taskImportance.get(task.id) || 1;
      const progress = task.progress || (task.status === 'completed' || task.status === 'approved' ? 100 : 0);
      
      totalWeightedProgress += progress * importance;
      totalImportance += importance;
    });
    
    return totalImportance > 0 ? Math.round(totalWeightedProgress / totalImportance) : 0;
  };
  
  // 기본적으로 기간 가중 평균을 사용
  return durationWeightedAverage();
};

/**
 * 프로젝트의 예상 완료일을 계산합니다.
 */
export const calculateEstimatedEndDate = (tasks: Task[]): string | null => {
  if (!tasks || tasks.length === 0) return null;
  
  // 모든 태스크의 종료일 중 가장 늦은 날짜
  const latestEndDate = tasks.reduce((latest, task) => {
    const taskEnd = new Date(task.endDate);
    return taskEnd > latest ? taskEnd : latest;
  }, new Date(0));
  
  // 진행도를 고려한 조정 (선택적)
  const overallProgress = calculateOverallProgress(tasks);
  if (overallProgress < 50) {
    // 진행도가 낮으면 예상 완료일을 연장할 수 있음
    const delayDays = Math.round((100 - overallProgress) / 10);
    latestEndDate.setDate(latestEndDate.getDate() + delayDays);
  }
  
  return formatDateISO(latestEndDate);
};

/**
 * 태스크 목록에서 프로젝트 상태를 계산합니다.
 */
export const calculateProjectStatus = (tasks: Task[]): '시작전' | '진행중' | '완료' => {
  if (!tasks || tasks.length === 0) return '시작전';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 모든 태스크가 완료되었는지 확인
  const allCompleted = tasks.every(task => task.status === 'completed');
  if (allCompleted) return '완료';
  
  // 진행 중인 태스크가 있는지 확인
  const hasInProgress = tasks.some(task => task.status === 'in-progress');
  if (hasInProgress) return '진행중';
  
  // 시작된 태스크가 있는지 확인 (오늘 날짜가 태스크 기간 내에 있는 경우)
  const hasStarted = tasks.some(task => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    return today >= startDate && today <= endDate;
  });
  if (hasStarted) return '진행중';
  
  // 완료된 태스크가 하나라도 있는지 확인
  const hasCompleted = tasks.some(task => task.status === 'completed');
  if (hasCompleted) return '진행중';
  
  return '시작전';
};

/**
 * Schedule ID를 생성합니다.
 */
export const generateScheduleId = (projectId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `SCH-${projectId}-${timestamp}-${random}`;
};