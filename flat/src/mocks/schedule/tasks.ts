import type { Task, Schedule } from '../../types/schedule';
import { formatDate, addDays, getToday } from './utils';
import { TASK_TYPES } from '../../constants/factory';

const today = getToday();

/**
 * Mock 태스크 데이터 - 다양한 시나리오 포함
 */
export const mockTasks: Task[] = [
  // (주)연우 태스크들
  {
    id: 101,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.DESIGN,
    taskType: TASK_TYPES.CONTAINER.DESIGN,
    startDate: formatDate(addDays(today, -3)),
    endDate: formatDate(addDays(today, -1)),
    factory: '(주)연우',
    factoryId: 'cont-1',
    assignee: '김영수',
    status: 'completed'
  },
  {
    id: 102,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.MOLD_MAKING,
    taskType: TASK_TYPES.CONTAINER.MOLD_MAKING,
    startDate: formatDate(addDays(today, -2)),
    endDate: formatDate(today),
    factory: '(주)연우',
    factoryId: 'cont-1',
    assignee: '이미나',
    status: 'in-progress'
  },
  {
    id: 103,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.PROTOTYPE_MAKING,
    taskType: TASK_TYPES.CONTAINER.PROTOTYPE_MAKING,
    startDate: formatDate(addDays(today, -1)),
    endDate: formatDate(addDays(today, 1)),
    factory: '(주)연우',
    factoryId: 'cont-1',
    assignee: '박준호',
    status: 'in-progress'
  }
];

/**
 * 프로젝트 ID로 태스크 필터링
 */
export const getTasksByProjectId = (projectId: string): Task[] => {
  return mockTasks.filter(task => task.projectId === projectId);
};

/**
 * 상태별 태스크 필터링
 */
export const getTasksByStatus = (status: Task['status']): Task[] => {
  return mockTasks.filter(task => task.status === status);
};

/**
 * 공장별 태스크 필터링
 */
export const getTasksByFactory = (factory: string): Task[] => {
  return mockTasks.filter(task => task.factory === factory);
};

/**
 * 진행 중인 태스크 생성
 */
export const createInProgressTasks = (schedule: Schedule): Task[] => {
  const inProgressTasks: Task[] = [];
  let taskId = Math.max(...schedule.tasks.map(t => 
    typeof t.id === 'number' ? t.id : parseInt(String(t.id)) || 0
  )) + 1;
  
  schedule.participants.forEach((participant, index) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 2); // 2일 전 시작
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // 3일 후 종료
    
    const taskTypes = [
      TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK,
      TASK_TYPES.CONTAINER.INJECTION_MOLDING,
      TASK_TYPES.PACKAGING.PACKAGING_WORK
    ];
    
    inProgressTasks.push({
      id: taskId++,
      factory: participant.name,
      factoryId: participant.id,
      taskType: taskTypes[index] || taskTypes[0],
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      color: participant.color,
      status: 'in-progress',
      projectId: schedule.projectId
    });
  });
  
  return inProgressTasks;
};