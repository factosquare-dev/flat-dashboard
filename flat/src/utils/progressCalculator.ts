import { Task, TaskStatus } from '../types/schedule';

export interface ProgressInfo {
  progress: number; // 0-100
  currentStages: string[]; // 오늘 진행 중인 태스크들
  totalTasks: number;
  completedTasks: number;
  todayTasks: Task[];
}

/**
 * 날짜가 오늘인지 확인합니다.
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * 특정 날짜가 시작일과 종료일 사이에 있는지 확인합니다.
 */
function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * 태스크 배열로부터 진행률과 현재 진행 단계를 계산합니다.
 * 
 * @param tasks - 계산할 태스크 배열
 * @returns 진행률 정보
 */
export function calculateProgressFromTasks(tasks: Task[]): ProgressInfo {
  if (!tasks || tasks.length === 0) {
    return {
      progress: 0,
      currentStages: [],
      totalTasks: 0,
      completedTasks: 0,
      todayTasks: []
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
  
  // 완료된 태스크 수 계산
  const completedTasks = tasks.filter(task => 
    task.status === TaskStatus.COMPLETED || 
    task.status === TaskStatus.APPROVED
  ).length;
  
  // 진행률 계산 (완료된 태스크 / 전체 태스크)
  const progress = Math.round((completedTasks / tasks.length) * 100);
  
  // 오늘 날짜에 걸쳐있고 완료되지 않은 태스크 찾기
  const todayTasks = tasks.filter(task => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    // 오늘이 태스크 기간에 포함되는지 확인
    const isTodayInTaskPeriod = isDateInRange(today, startDate, endDate) ||
                                 isToday(startDate) || 
                                 isToday(endDate);
    
    // 완료되지 않은 상태인지 확인
    const isNotCompleted = task.status !== TaskStatus.COMPLETED && 
                          task.status !== TaskStatus.APPROVED &&
                          task.status !== TaskStatus.REJECTED;
    
    // Individual task logging removed for cleaner console
    
    return isTodayInTaskPeriod && isNotCompleted;
  });
  
  // 현재 진행 중인 단계들 (중복 제거)
  const currentStages = [...new Set(todayTasks.map(task => task.title))];
  
  return {
    progress,
    currentStages,
    totalTasks: tasks.length,
    completedTasks,
    todayTasks
  };
}

/**
 * 태스크 타입을 한글 레이블로 변환합니다.
 */
export function getTaskTypeLabel(type: Task['type']): string {
  const typeLabels: Record<Task['type'], string> = {
    material: '원료',
    production: '제조',
    quality: '품질',
    packaging: '포장',
    inspection: '검사',
    shipping: '배송',
    other: '기타'
  };
  
  return typeLabels[type] || type;
}

/**
 * 태스크의 팩토리 정보로부터 진행 단계를 그룹화합니다.
 */
export function groupTasksByFactory(tasks: Task[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  tasks.forEach(task => {
    const factory = task.factory || '기타';
    if (!grouped[factory]) {
      grouped[factory] = [];
    }
    grouped[factory].push(task.title);
  });
  
  return grouped;
}