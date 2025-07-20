import type { Task } from '../types/schedule';

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
    
    while (!foundRow) {
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
  
  while (!foundValidRange) {
    const testTask: Task = {
      id: -1,
      projectId,
      title: '',
      startDate: currentStart.toISOString().split('T')[0],
      endDate: currentEnd.toISOString().split('T')[0],
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
    }
  }
  
  return {
    startDate: currentStart.toISOString().split('T')[0],
    endDate: currentEnd.toISOString().split('T')[0]
  };
};