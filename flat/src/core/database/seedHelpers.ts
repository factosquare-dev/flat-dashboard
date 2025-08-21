/**
 * Helper functions for seed data generation
 */

import { ProjectType, ProjectStatus } from '@/shared/types/project';
import { TaskStatus, TaskType } from '@/shared/types/schedule';
import { Priority } from '@/shared/types/enums';

/**
 * Assigns project type based on index
 */
export function assignProjectType(index: number): ProjectType {
  if (index < 10) return ProjectType.MASTER;
  if (index < 50) return ProjectType.SUB;
  return ProjectType.TASK;
}

/**
 * Assigns project status based on index
 */
export function assignProjectStatus(index: number): ProjectStatus {
  if (index % 5 === 0) return ProjectStatus.PLANNING;
  if (index % 3 === 0) return ProjectStatus.COMPLETED;
  if (index % 7 === 0) return ProjectStatus.ON_HOLD;
  return ProjectStatus.IN_PROGRESS;
}

/**
 * Assigns priority in a distributed manner
 */
export function assignProjectPriority(index: number): Priority {
  if (index % 7 === 0) return Priority.HIGH;
  if (index % 3 === 0) return Priority.LOW;
  return Priority.MEDIUM;
}

/**
 * Determines task status based on start/end dates and project status
 */
export function getTaskStatus(
  startDate: Date,
  endDate: Date,
  projectStatus: ProjectStatus
): TaskStatus {
  const now = new Date();
  
  // If project is completed, all tasks should be completed
  if (projectStatus === ProjectStatus.COMPLETED) {
    return TaskStatus.COMPLETED;
  }
  
  // If project is in planning, all tasks are pending
  if (projectStatus === ProjectStatus.PLANNING) {
    return TaskStatus.PENDING;
  }
  
  // For other project statuses, check task dates
  if (endDate < now) {
    return TaskStatus.COMPLETED;
  } else if (startDate <= now && endDate >= now) {
    return TaskStatus.IN_PROGRESS;
  } else {
    return TaskStatus.PENDING;
  }
}

/**
 * Infers task type from title using Korean keywords
 */
export function inferTaskTypeFromTitle(title: string): TaskType {
  const typeMap: Record<string, TaskType> = {
    // Design/Planning
    '디자인': TaskType.DESIGN,
    '설계': TaskType.DESIGN,
    '기획': TaskType.DESIGN,
    
    // Material/Sourcing
    '원료': TaskType.SOURCING,
    '소재': TaskType.SOURCING,
    '구매': TaskType.SOURCING,
    '조달': TaskType.SOURCING,
    
    // Preparation
    '준비': TaskType.PREPARATION,
    '세팅': TaskType.PREPARATION,
    
    // Quality/Testing
    '품질': TaskType.QUALITY_CHECK,
    '테스트': TaskType.QUALITY_CHECK,
    '검사': TaskType.QUALITY_CHECK,
    
    // Production
    '제조': TaskType.PRODUCTION,
    '생산': TaskType.PRODUCTION,
    '혼합': TaskType.PRODUCTION,
    '배합': TaskType.PRODUCTION,
    '충전': TaskType.PRODUCTION,
    '성형': TaskType.PRODUCTION,
    
    // Packaging
    '포장': TaskType.PACKAGING,
    '라벨': TaskType.PACKAGING,
    '박스': TaskType.PACKAGING,
    
    // Shipping
    '배송': TaskType.SHIPPING,
    '출하': TaskType.SHIPPING,
    
    // Inspection
    '검수': TaskType.INSPECTION,
    '승인': TaskType.INSPECTION,
  };

  // Find matching type based on keywords in title
  for (const [keyword, type] of Object.entries(typeMap)) {
    if (title.includes(keyword)) {
      return type;
    }
  }
  
  return TaskType.OTHER; // Default fallback
}

/**
 * Gets task duration based on task complexity
 */
export function getTaskDuration(title: string): number {
  const durationMap: Record<string, number> = {
    // Quick tasks (1-2 days)
    '검수': 1,
    '승인': 1,
    '출하': 1,
    '라벨': 2,
    '준비': 2,
    
    // Medium tasks (3-5 days)
    '검사': 3,
    '품질': 3,
    '포장': 4,
    '작업': 4,
    '처리': 3,
    
    // Complex tasks (5-10 days)
    '제조': 7,
    '생산': 7,
    '혼합': 5,
    '배합': 5,
    '충전': 6,
    '성형': 6,
    '디자인': 5,
    '설계': 7,
    
    // Long tasks (10+ days)
    '개발': 10,
    '시험': 10,
    '인증': 14,
    '평가': 10,
  };

  // Check each keyword in the title
  for (const [keyword, duration] of Object.entries(durationMap)) {
    if (title.includes(keyword)) {
      return duration;
    }
  }
  
  // Default duration: 5 days
  return 5;
}

/**
 * Calculate progress percentage based on task status and dates
 */
export function calculateProgress(
  status: TaskStatus,
  startDate: Date,
  endDate: Date
): number {
  switch (status) {
    case TaskStatus.COMPLETED:
      return 100;
    case TaskStatus.PENDING:
    case TaskStatus.CANCELLED:
      return 0;
    case TaskStatus.IN_PROGRESS:
      const now = new Date();
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      const progress = Math.round((elapsed / totalDuration) * 100);
      return Math.max(0, Math.min(100, progress));
    default:
      return 0;
  }
}