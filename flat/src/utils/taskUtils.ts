import type { Task } from '../types/schedule';
import { formatDateISO } from './dateUtils';

// 두 태스크가 날짜 범위에서 겹치는지 확인
export const isTaskOverlapping = (task1: Task, task2: Task): boolean => {
  if (task1.projectId !== task2.projectId) return false;
  if (task1.id === task2.id) return false;
  
  const start1 = new Date(task1.startDate).getTime();
  const end1 = new Date(task1.endDate).getTime();
  const start2 = new Date(task2.startDate).getTime();
  const end2 = new Date(task2.endDate).getTime();
  
  return !(end1 < start2 || start1 > end2);
};

// 프로젝트 내 모든 태스크와 충돌하는지 확인
export const findOverlappingTasks = (
  task: Task,
  allTasks: Task[]
): Task[] => {
  return allTasks.filter(t => isTaskOverlapping(task, t));
};

// 태스크에 row 인덱스 할당 (겹치지 않도록)
export const assignTaskRows = (tasks: Task[]): Map<number, number> => {
  const taskRows = new Map<number, number>();
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  sortedTasks.forEach(task => {
    let row = 0;
    let foundRow = false;
    const maxRows = 100; // 최대 100개 행까지만 검색
    
    while (!foundRow && row < maxRows) {
      // 현재 row에 있는 태스크들과 충돌 확인
      const tasksInRow = sortedTasks.filter(t => 
        taskRows.get(t.id) === row && isTaskOverlapping(task, t)
      );
      
      if (tasksInRow.length === 0) {
        taskRows.set(task.id, row);
        foundRow = true;
      } else {
        row++;
      }
    }
    
    // 빈 행을 찾지 못한 경우 마지막 행에 배치
    if (!foundRow) {
      taskRows.set(task.id, row);
    }
  });
  
  return taskRows;
};

// 프로젝트별로 필요한 행 수 계산
export const getProjectRowCount = (
  projectId: string,
  tasks: Task[]
): number => {
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  if (projectTasks.length === 0) return 1;
  
  const taskRows = assignTaskRows(projectTasks);
  return Math.max(...Array.from(taskRows.values())) + 1;
};

// 새 태스크가 기존 태스크와 겹치지 않는 날짜 찾기
export const findAvailableDateRange = (
  projectId: string,
  startDate: string,
  duration: number,
  existingTasks: Task[],
  excludeTaskId?: number
): { startDate: string; endDate: string } => {
  const projectTasks = existingTasks.filter(t => 
    t.projectId === projectId && t.id !== excludeTaskId
  );
  
  let currentStart = new Date(startDate);
  let currentEnd = new Date(currentStart);
  currentEnd.setDate(currentEnd.getDate() + duration);
  
  let foundValidRange = false;
  let attempts = 0;
  const maxAttempts = 365; // 최대 1년까지만 검색
  
  while (!foundValidRange && attempts < maxAttempts) {
    const testTask: Task = {
      id: -1,
      projectId,
      title: '',
      startDate: formatDateISO(currentStart),
      endDate: formatDateISO(currentEnd),
      x: 0,
      width: 0,
      color: '',
      factory: ''
    };
    
    const overlapping = findOverlappingTasks(testTask, projectTasks);
    
    if (overlapping.length === 0) {
      foundValidRange = true;
    } else {
      // 가장 가까운 빈 슬롯 찾기
      const latestEnd = Math.max(...overlapping.map(t => 
        new Date(t.endDate).getTime()
      ));
      currentStart = new Date(latestEnd + 24 * 60 * 60 * 1000);
      currentEnd = new Date(currentStart);
      currentEnd.setDate(currentEnd.getDate() + duration);
      attempts++;
    }
  }
  
  // 사용 가능한 날짜를 찾지 못한 경우 경고
  if (!foundValidRange) {
    console.warn(`Could not find available date range for project ${projectId} within 1 year`);
  }
  
  return {
    startDate: formatDateISO(currentStart),
    endDate: formatDateISO(currentEnd)
  };
};