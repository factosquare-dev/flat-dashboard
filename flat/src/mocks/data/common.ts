import { 
  FACTORY_TYPES, 
  CERTIFICATE_TYPE_OPTIONS,
  PROJECT_STATUS,
  PROJECT_PRIORITY,
  SERVICE_TYPES,
  TASK_TEMPLATES
} from '@/constants';

/**
 * Common mock data used across multiple modules
 */

// Company/Customer names
export const MOCK_CUSTOMER_NAMES = [
  '뷰티코리아',
  '그린코스메틱',
  '코스메디칼',
  '퍼스트뷰티',
  '블루오션코스메틱',
  '에코뷰티',
  '네이처코스메틱',
  '퓨어스킨',
] as const;

// Factory names by type
export const MOCK_FACTORY_NAMES = {
  [FACTORY_TYPES.MANUFACTURING]: [
    '큐셀시스템',
    '코스모로스',
    '바이오텍',
    '그린팜',
  ],
  [FACTORY_TYPES.CONTAINER]: [
    '(주)연우',
    '컨테이너텍',
    '패키지마스터',
    '용기나라',
  ],
  [FACTORY_TYPES.PACKAGING]: [
    '(주)네트모베이지',
    '패키징솔루션',
    '박스프로',
    '포장명가',
  ],
} as const;

// Manager names
export const MOCK_MANAGER_NAMES = [
  '김철수',
  '이영희',
  '박민수',
  '정수진',
  '최동욱',
  '강미정',
  '윤서준',
  '임하나',
] as const;

// Product types
export const MOCK_PRODUCT_TYPES = [
  '스킨케어',
  '메이크업',
  '헤어케어',
  '바디케어',
  '선케어',
  '클렌징',
  '마스크팩',
  '에센스',
] as const;

// Task templates by factory type
export const MOCK_TASKS_BY_FACTORY_TYPE = {
  [FACTORY_TYPES.MANUFACTURING]: [
    TASK_TEMPLATES.RAW_MATERIAL_PREP,
    TASK_TEMPLATES.MIXING_MANUFACTURING,
    TASK_TEMPLATES.STABILITY_TEST,
    TASK_TEMPLATES.QUALITY_INSPECTION,
  ],
  [FACTORY_TYPES.CONTAINER]: [
    TASK_TEMPLATES.MOLD_MAKING,
    TASK_TEMPLATES.TRIAL_MOLDING,
    TASK_TEMPLATES.INJECTION_MOLDING,
    TASK_TEMPLATES.CONTAINER_DESIGN,
  ],
  [FACTORY_TYPES.PACKAGING]: [
    TASK_TEMPLATES.DESIGN_WORK,
    TASK_TEMPLATES.PACKAGING_WORK,
    TASK_TEMPLATES.PROTOTYPE_MAKING,
  ],
} as const;

// Project colors for Gantt chart
export const MOCK_PROJECT_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#84CC16", // Lime
  "#F97316", // Orange
  "#06B6D4", // Cyan
] as const;

// Helper function to get random item from array
export function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random date between range
export function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate random Korean phone number
export function generatePhoneNumber(): string {
  const prefixes = ['010', '02', '031', '032', '033'];
  const prefix = getRandomItem(prefixes);
  const middle = Math.floor(Math.random() * 9000 + 1000);
  const last = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${middle}-${last}`;
}

// Helper function to generate random email
export function generateEmail(name: string): string {
  const domains = ['gmail.com', 'naver.com', 'daum.net', 'company.co.kr'];
  const username = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${username}@${getRandomItem(domains)}`;
}