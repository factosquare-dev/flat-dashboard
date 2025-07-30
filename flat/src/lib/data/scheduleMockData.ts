import type { MockTask, Participant } from '../types/mockSchedule';
import { factories } from './factories';
import { TASK_TYPES, FACTORY_TYPES } from '../constants/factory';
import { FactoryType, FactoryTypeLabel, TaskStatus } from '../types/enums';

// 오늘 날짜 기준으로 날짜 계산
const today = new Date();
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  result.setUTCHours(0, 0, 0, 0);
  return result;
};

// The Rule of Three: This pattern appeared 20+ times
const getDateFromToday = (daysOffset: number): string => {
  return formatDate(addDays(today, daysOffset));
};

// factories.ts데이터를 기반으로 Participant 생성
const createParticipantsFromFactories = (): Participant[] => {
  const colors = ['#EF4444', '#3B82F6', '#EAB308', '#06B6D4', '#10B981', '#F97316', '#14B8A6', '#6366F1', '#EC4899', '#6B7280'];
  
  // Use enum values and labels for consistency
  const getFactoryTypeLabel = (type: FactoryType): string => {
    return FactoryTypeLabel[type] || '공장';
  };
  
  return factories.map((factory, index) => ({
    id: factory.id,
    name: factory.name,
    type: getFactoryTypeLabel(factory.type),
    period: '2024-01 ~ 2024-12',
    color: colors[index % colors.length]
  }));
};

// Mock 공장 데이터 - factories.ts에서 생성
export const mockFactories: Participant[] = createParticipantsFromFactories();

// Helper function to find first factory by type label (Rule of Three applied)
const findFactoryByTypeLabel = (typeLabel: string) => {
  return mockFactories.find(f => f.type === typeLabel);
};

// Cache frequently used factories to avoid repeated lookups
const containerFactory = findFactoryByTypeLabel(FactoryTypeLabel[FactoryType.CONTAINER]);

// Mock 태스크 데이터 - 다양한 시나리오 포함 (아이콘 테스트용)
export const mockTasks: MockTask[] = [
  // 용기 공장 태스크들
  {
    id: 101,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.DESIGN,
    taskType: TASK_TYPES.CONTAINER.DESIGN,
    startDate: getDateFromToday(-3),
    endDate: getDateFromToday(-1),
    factory: containerFactory?.name || '(주)연우',
    factoryId: containerFactory?.id || 'cont-1',
    assignee: '김영수',
    status: TaskStatus.COMPLETED  },
  {
    id: 102,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.MOLD_MAKING,
    taskType: TASK_TYPES.CONTAINER.MOLD_MAKING,
    startDate: getDateFromToday(-2),
    endDate: getDateFromToday(0),
    factory: containerFactory?.name || '(주)연우',
    factoryId: containerFactory?.id || 'cont-1',
    assignee: '이미나',
    status: TaskStatus.IN_PROGRESS  },
  {
    id: 103,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.PROTOTYPE_MAKING,
    taskType: TASK_TYPES.CONTAINER.PROTOTYPE_MAKING,
    startDate: getDateFromToday(-1),
    endDate: getDateFromToday(1),
    factory: containerFactory?.name || '(주)연우',
    factoryId: containerFactory?.id || 'cont-1',
    assignee: '박준호',
    status: TaskStatus.IN_PROGRESS  },
  {
    id: 104,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.INJECTION_MOLDING,
    taskType: TASK_TYPES.CONTAINER.INJECTION_MOLDING,
    startDate: getDateFromToday(0),
    endDate: getDateFromToday(3),
    factory: containerFactory?.name || '(주)연우',
    factoryId: containerFactory?.id || 'cont-1',
    assignee: '최서연',
    status: TaskStatus.PENDING  },
  {
    id: 105,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.CONTAINER_INSPECTION,
    taskType: TASK_TYPES.CONTAINER.CONTAINER_INSPECTION,
    startDate: getDateFromToday(2),
    endDate: getDateFromToday(4),
    factory: containerFactory?.name || '(주)연우',
    factoryId: containerFactory?.id || 'cont-1',
    assignee: '김영수',
    status: TaskStatus.PENDING  },
  {
    id: 106,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.QUALITY_CHECK,
    taskType: TASK_TYPES.CONTAINER.QUALITY_CHECK,
    startDate: getDateFromToday(3),
    endDate: getDateFromToday(4),
    factory: containerFactory?.name || '(주)연우',
    factoryId: containerFactory?.id || 'cont-1',
    assignee: '이미나',
    status: TaskStatus.PENDING  },
  {
    id: 107,
    projectId: 'cont-1',
    title: TASK_TYPES.CONTAINER.SHIPPING,
    taskType: TASK_TYPES.CONTAINER.SHIPPING,
    startDate: getDateFromToday(4),
    endDate: getDateFromToday(5),
    factory: containerFactory?.name || '(주)연우',
    factoryId: containerFactory?.id || 'cont-1',
    assignee: '박준호',
    status: TaskStatus.PENDING  },
  // 제조 공장 태스크들 
  {
    id: 1,
    projectId: 'mfg-1',
    title: TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT,
    taskType: TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT,
    startDate: getDateFromToday(-20),
    endDate: getDateFromToday(-17),
    factory: mockFactories.find(f => f.name === '큐셀시스템')?.name || '큐셀시스템',
    factoryId: mockFactories.find(f => f.name === '큐셀시스템')?.id || 'mfg-1',
    assignee: '김철수',
    status: TaskStatus.COMPLETED  },
  {
    id: 2,
    projectId: 'mfg-1',
    title: TASK_TYPES.MANUFACTURING.MIXING,
    taskType: TASK_TYPES.MANUFACTURING.MIXING,
    startDate: getDateFromToday(-16),
    endDate: getDateFromToday(-10),
    factory: mockFactories.find(f => f.name === '큐셀시스템')?.name || '큐셀시스템',
    factoryId: mockFactories.find(f => f.name === '큐셀시스템')?.id || 'mfg-1',
    assignee: '김철수',
    status: TaskStatus.COMPLETED  },
  
  // 지연된 태스크들 - 시계 아이콘 표시 (종료일이 지났는데 완료되지 않음)
  {
    id: 3,
    projectId: 'cont-2',
    title: '금형 제작 (지연)',
    startDate: getDateFromToday(-10),
    endDate: getDateFromToday(-3),
    factory: mockFactories.find(f => f.name.includes('삼화'))?.name || '삼화플라스틱',
    assignee: '이영희',
    status: TaskStatus.IN_PROGRESS  },
  {
    id: 4,
    projectId: 'pack-1',
    title: '디자인 검토 (지연)',
    startDate: getDateFromToday(-15),
    endDate: getDateFromToday(-5),
    factory: mockFactories.find(f => f.id === 'pack-1')?.name || '(주)네트모베이지',
    factoryId: 'pack-1',
    assignee: '정수진',
    status: TaskStatus.PENDING  },
  
  // 진행 중인 태스크들 - 아이콘 없음
  {
    id: 5,
    projectId: 'cont-2',
    title: '사출 성형',
    startDate: getDateFromToday(-2),
    endDate: getDateFromToday(5),
    factory: mockFactories.find(f => f.name.includes('삼화'))?.name || '삼화플라스틱',
    assignee: '이영희',
    status: TaskStatus.IN_PROGRESS  },
  {
    id: 6,
    projectId: 'mfg-2',
    title: '원료 검수',
    startDate: getDateFromToday(-1),
    endDate: getDateFromToday(3),
    factory: mockFactories.find(f => f.name.includes('코스모로스'))?.name || '주식회사 코스모로스',
    assignee: '최현우',
    status: TaskStatus.IN_PROGRESS  },
  
  // 완료된 태스크들 추가 - 체크마크 아이콘 표시
  {
    id: 7,
    projectId: 'mfg-1',
    title: '품질 검사',
    startDate: getDateFromToday(-9),
    endDate: getDateFromToday(-7),
    factory: mockFactories.find(f => f.id === 'mfg-1')?.name || '큐셀시스템',
    factoryId: 'mfg-1',
    assignee: '박민수',
    status: TaskStatus.COMPLETED  },
  {
    id: 8,
    projectId: 'mfg-2',
    title: '안정성 테스트',
    startDate: getDateFromToday(-8),
    endDate: getDateFromToday(-4),
    factory: mockFactories.find(f => f.name.includes('코스모로스'))?.name || '주식회사 코스모로스',
    assignee: '최현우',
    status: TaskStatus.COMPLETED  },
  
  // 예정된 태스크들 - 아이콘 없음
  {
    id: 9,
    projectId: 'pack-1',
    title: '인쇄 준비',
    startDate: getDateFromToday(3),
    endDate: getDateFromToday(7),
    factory: mockFactories.find(f => f.id === 'pack-1')?.name || '(주)네트모베이지',
    factoryId: 'pack-1',
    assignee: '정수진',
    status: TaskStatus.PENDING  },
  {
    id: 10,
    projectId: 'cont-2',
    title: '표면 처리',
    startDate: getDateFromToday(8),
    endDate: getDateFromToday(12),
    factory: mockFactories.find(f => f.id === 'cont-2')?.name || '삼화플라스틱',
    factoryId: 'cont-2',
    assignee: '이영희',
    status: TaskStatus.PENDING  }
];

// 프로젝트 기간 계산 함수
export const calculateProjectPeriod = (tasks: Task[]): { startDate: string; endDate: string } => {
  if (tasks.length === 0) {
    const today = formatDate(new Date());
    return { startDate: today, endDate: today };
  }
  
  const dates = tasks.flatMap(task => [new Date(task.startDate), new Date(task.endDate)]);
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  return {
    startDate: formatDate(minDate),
    endDate: formatDate(maxDate)
  };
};