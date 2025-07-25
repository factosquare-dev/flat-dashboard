// Central export point for all constants
export * from './factory';
export * from './project';
export * from './tasks';
export * from './common';
export * from './time';
export * from './gantt';
export * from './ui';

// Mock data constants
export const MOCK_COMPANY_NAMES = [
  '뷰티코리아',
  '그린코스메틱',
  '코스메디칼',
  '퍼스트뷰티',
] as const;

export const MOCK_FACTORY_NAMES = [
  '큐셀시스템',
  '(주)연우',
  '(주)네트모베이지',
  '주식회사 코스모로스',
] as const;

// Navigation items (currently in English)
export const NAVIGATION_ITEMS = {
  DASHBOARD: 'Dashboard',
  PROJECTS: 'Projects',
  USERS: 'Users',
  FACTORIES: 'Factories',
} as const;