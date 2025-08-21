import { FactoryType } from '@/shared/types/enums';

export const DEFAULT_TASKS = {
  MANUFACTURING: [
    '원료 준비',
    '혼합 및 제조',
    '안정성 테스트',
  ],
  CONTAINER: [
    '금형 제작',
    '시홍 성형',
    '사출 성형',
  ],
  PACKAGING: [
    '디자인 작업',
    '포장 작업',
  ],
} as const;

export const TASK_TEMPLATES = {
  // Manufacturing tasks
  RAW_MATERIAL_PREP: '원료 준비',
  MIXING_MANUFACTURING: '혼합 및 제조',
  STABILITY_TEST: '안정성 테스트',
  
  // Container tasks
  MOLD_MAKING: '금형 제작',
  TRIAL_MOLDING: '시홍 성형',
  INJECTION_MOLDING: '사출 성형',
  CONTAINER_DESIGN: '용기 디자인',
  
  // Packaging tasks
  DESIGN_WORK: '디자인 작업',
  PACKAGING_WORK: '포장 작업',
  
  // Common tasks
  PROTOTYPE_MAKING: '시제품 제작',
  QUALITY_INSPECTION: '품질 검사',
} as const;

export type TaskTemplate = typeof TASK_TEMPLATES[keyof typeof TASK_TEMPLATES];

// Task durations in days
export const TASK_DURATIONS = {
  [TASK_TEMPLATES.RAW_MATERIAL_PREP]: 3,
  [TASK_TEMPLATES.MIXING_MANUFACTURING]: 7,
  [TASK_TEMPLATES.STABILITY_TEST]: 14,
  [TASK_TEMPLATES.MOLD_MAKING]: 10,
  [TASK_TEMPLATES.TRIAL_MOLDING]: 5,
  [TASK_TEMPLATES.INJECTION_MOLDING]: 7,
  [TASK_TEMPLATES.CONTAINER_DESIGN]: 5,
  [TASK_TEMPLATES.DESIGN_WORK]: 7,
  [TASK_TEMPLATES.PACKAGING_WORK]: 5,
  [TASK_TEMPLATES.PROTOTYPE_MAKING]: 7,
  [TASK_TEMPLATES.QUALITY_INSPECTION]: 3,
} as const;

export const getDefaultTasksForFactory = (factoryType: FactoryType): string[] => {
  switch (factoryType) {
    case FactoryType.MANUFACTURING:
      return DEFAULT_TASKS.MANUFACTURING;
    case FactoryType.CONTAINER:
      return DEFAULT_TASKS.CONTAINER;
    case FactoryType.PACKAGING:
      return DEFAULT_TASKS.PACKAGING;
    default:
      return [];
  }
};