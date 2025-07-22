import type { Task, Participant } from '../types/schedule';

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
  result.setDate(result.getDate() + days);
  return result;
};

// Mock 공장 데이터
export const mockFactories: Participant[] = [
  {
    id: 'cont-1',
    name: '(주)연우',
    type: '용기',
    period: '2024-01 ~ 2024-12',
    color: '#EF4444' // 레드
  },
  {
    id: 'mfg-1',
    name: '큐셀시스템',
    type: '제조',
    period: '2024-01 ~ 2024-12',
    color: '#3B82F6' // 블루
  },
  {
    id: 'pack-1',
    name: '(주)네트모베이지',
    type: '포장',
    period: '2024-01 ~ 2024-12',
    color: '#EAB308' // 옐로우
  },
  {
    id: 'mfg-2',
    name: '주식회사 코스모로스',
    type: '제조',
    period: '2024-01 ~ 2024-12',
    color: '#06B6D4' // 시안
  },
  {
    id: 'cont-2',
    name: '삼화플라스틱',
    type: '용기',
    period: '2024-01 ~ 2024-12',
    color: '#10B981' // 에메랄드
  },
  {
    id: 'pack-2',
    name: '서울포장산업(주)',
    type: '포장',
    period: '2024-01 ~ 2024-12',
    color: '#F97316' // 오렌지
  },
  {
    id: 'mfg-3',
    name: '(주)뷰티팩토리',
    type: '제조',
    period: '2024-01 ~ 2024-12',
    color: '#14B8A6' // 틸
  },
  {
    id: 'cont-3',
    name: '(주)에이치피씨',
    type: '용기',
    period: '2024-01 ~ 2024-12',
    color: '#6366F1' // 인디고
  },
  {
    id: 'mfg-4',
    name: '코스메카코리아',
    type: '제조',
    period: '2024-01 ~ 2024-12',
    color: '#EC4899' // 핑크
  },
  {
    id: 'mfg-5',
    name: '(주)아모레퍼시픽 오산공장',
    type: '제조',
    period: '2024-01 ~ 2024-12',
    color: '#6B7280' // 그레이
  },
  {
    id: 'factory-1',
    name: '삼성전자 천안공장',
    type: '제조',
    period: '2024-01 ~ 2024-12',
    color: '#3B82F6' // 블루
  },
  {
    id: 'factory-2',
    name: 'LG화학 오창공장',
    type: '용기',
    period: '2024-01 ~ 2024-12',
    color: '#10B981' // 에메랄드
  },
  {
    id: 'factory-3',
    name: '아모레퍼시픽 대전공장',
    type: '포장',
    period: '2024-01 ~ 2024-12',
    color: '#8B5CF6' // 바이올렛
  },
  {
    id: 'factory-4',
    name: '한국콜마 세종공장',
    type: '제조',
    period: '2024-01 ~ 2024-12',
    color: '#F59E0B' // 앰버
  }
];

// Mock 태스크 데이터 - 다양한 시나리오 포함 (아이콘 테스트용)
export const mockTasks: Task[] = [
  // (주)연우 태스크들
  {
    id: 101,
    projectId: 'cont-1',
    title: '용기 디자인',
    startDate: formatDate(addDays(today, -3)),
    endDate: formatDate(addDays(today, -1)),
    factory: '(주)연우',
    assignee: '김영수',
    status: 'completed'
  },
  {
    id: 102,
    projectId: 'cont-1',
    title: '금형 제작',
    startDate: formatDate(addDays(today, -2)),
    endDate: formatDate(today),
    factory: '(주)연우',
    assignee: '이미나',
    status: 'in-progress'
  },
  {
    id: 103,
    projectId: 'cont-1',
    title: '시제품 제작',
    startDate: formatDate(addDays(today, -1)),
    endDate: formatDate(addDays(today, 1)),
    factory: '(주)연우',
    assignee: '박준호',
    status: 'in-progress'
  },
  {
    id: 104,
    projectId: 'cont-1',
    title: '사출 성형',
    startDate: formatDate(today),
    endDate: formatDate(addDays(today, 3)),
    factory: '(주)연우',
    assignee: '최서연',
    status: 'pending'
  },
  {
    id: 105,
    projectId: 'cont-1',
    title: '용기 검사',
    startDate: formatDate(addDays(today, 2)),
    endDate: formatDate(addDays(today, 4)),
    factory: '(주)연우',
    assignee: '김영수',
    status: 'pending'
  },
  {
    id: 106,
    projectId: 'cont-1',
    title: '품질 검사',
    startDate: formatDate(addDays(today, 3)),
    endDate: formatDate(addDays(today, 4)),
    factory: '(주)연우',
    assignee: '이미나',
    status: 'pending'
  },
  {
    id: 107,
    projectId: 'cont-1',
    title: '출하',
    startDate: formatDate(addDays(today, 4)),
    endDate: formatDate(addDays(today, 5)),
    factory: '(주)연우',
    assignee: '박준호',
    status: 'pending'
  },
  // 큐셀시스템 태스크들
  {
    id: 1,
    projectId: 'mfg-1',
    title: '원료 수령',
    startDate: formatDate(addDays(today, -20)),
    endDate: formatDate(addDays(today, -17)),
    factory: '큐셀시스템',
    assignee: '김철수',
    status: 'completed'
  },
  {
    id: 2,
    projectId: 'mfg-1',
    title: '배합',
    startDate: formatDate(addDays(today, -16)),
    endDate: formatDate(addDays(today, -10)),
    factory: '큐셀시스템',
    assignee: '김철수',
    status: 'completed'
  },
  
  // 지연된 태스크들 - 시계 아이콘 표시 (종료일이 지났는데 완료되지 않음)
  {
    id: 3,
    projectId: 'cont-2',
    title: '금형 제작 (지연)',
    startDate: formatDate(addDays(today, -10)),
    endDate: formatDate(addDays(today, -3)),
    factory: '삼화플라스틱',
    assignee: '이영희',
    status: 'in-progress'
  },
  {
    id: 4,
    projectId: 'pack-1',
    title: '디자인 검토 (지연)',
    startDate: formatDate(addDays(today, -15)),
    endDate: formatDate(addDays(today, -5)),
    factory: '(주)네트모베이지',
    assignee: '정수진',
    status: 'pending'
  },
  
  // 진행 중인 태스크들 - 아이콘 없음
  {
    id: 5,
    projectId: 'cont-2',
    title: '사출 성형',
    startDate: formatDate(addDays(today, -2)),
    endDate: formatDate(addDays(today, 5)),
    factory: '삼화플라스틱',
    assignee: '이영희',
    status: 'in-progress'
  },
  {
    id: 6,
    projectId: 'mfg-2',
    title: '원료 검수',
    startDate: formatDate(addDays(today, -1)),
    endDate: formatDate(addDays(today, 3)),
    factory: '주식회사 코스모로스',
    assignee: '최현우',
    status: 'in-progress'
  },
  
  // 완료된 태스크들 추가 - 체크마크 아이콘 표시
  {
    id: 7,
    projectId: 'mfg-1',
    title: '품질 검사',
    startDate: formatDate(addDays(today, -9)),
    endDate: formatDate(addDays(today, -7)),
    factory: '큐셀시스템',
    assignee: '박민수',
    status: 'completed'
  },
  {
    id: 8,
    projectId: 'mfg-2',
    title: '안정성 테스트',
    startDate: formatDate(addDays(today, -8)),
    endDate: formatDate(addDays(today, -4)),
    factory: '주식회사 코스모로스',
    assignee: '최현우',
    status: 'completed'
  },
  
  // 예정된 태스크들 - 아이콘 없음
  {
    id: 9,
    projectId: 'pack-1',
    title: '인쇄 준비',
    startDate: formatDate(addDays(today, 3)),
    endDate: formatDate(addDays(today, 7)),
    factory: '(주)네트모베이지',
    assignee: '정수진',
    status: 'pending'
  },
  {
    id: 10,
    projectId: 'cont-2',
    title: '표면 처리',
    startDate: formatDate(addDays(today, 8)),
    endDate: formatDate(addDays(today, 12)),
    factory: '삼화플라스틱',
    assignee: '이영희',
    status: 'pending'
  }
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