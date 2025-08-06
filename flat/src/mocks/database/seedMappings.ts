/**
 * Seed data for status, priority, and type mappings
 */

export interface StatusMapping {
  id: string;
  type: 'project' | 'task';
  code: string;
  displayName: string;
  displayNameEn: string;
  color: string;
  order: number;
}

export interface PriorityMapping {
  id: string;
  code: string;
  displayName: string;
  displayNameEn: string;
  color: string;
  order: number;
}

export interface ServiceTypeMapping {
  id: string;
  code: string;
  displayName: string;
  displayNameEn: string;
  description: string;
  order: number;
}

export interface ProjectTypeMapping {
  id: string;
  code: string;
  displayName: string;
  displayNameEn: string;
  order: number;
}

export function createStatusMappings(): StatusMapping[] {
  const projectStatuses: StatusMapping[] = [
    { id: 'status-proj-1', type: 'project', code: 'PLANNING', displayName: '시작전', displayNameEn: 'Planning', color: '#64748B', order: 1 },
    { id: 'status-proj-2', type: 'project', code: 'IN_PROGRESS', displayName: '진행중', displayNameEn: 'In Progress', color: '#3B82F6', order: 2 },
    { id: 'status-proj-3', type: 'project', code: 'ON_HOLD', displayName: '보류', displayNameEn: 'On Hold', color: '#F59E0B', order: 3 },
    { id: 'status-proj-4', type: 'project', code: 'COMPLETED', displayName: '완료', displayNameEn: 'Completed', color: '#10B981', order: 4 },
    { id: 'status-proj-5', type: 'project', code: 'CANCELLED', displayName: '중단', displayNameEn: 'Cancelled', color: '#EF4444', order: 5 },
  ];

  const taskStatuses: StatusMapping[] = [
    { id: 'status-task-1', type: 'task', code: 'planning', displayName: '시작전', displayNameEn: 'Planning', color: '#6B7280', order: 1 },
    { id: 'status-task-2', type: 'task', code: 'in-progress', displayName: '진행중', displayNameEn: 'In Progress', color: '#3B82F6', order: 2 },
    { id: 'status-task-3', type: 'task', code: 'completed', displayName: '완료', displayNameEn: 'Completed', color: '#10B981', order: 3 },
    { id: 'status-task-4', type: 'task', code: 'cancelled', displayName: '중단', displayNameEn: 'Cancelled', color: '#EF4444', order: 4 },
  ];

  return [...projectStatuses, ...taskStatuses];
}

export function createPriorityMappings(): PriorityMapping[] {
  return [
    { id: 'priority-1', code: 'HIGH', displayName: '높음', displayNameEn: 'High', color: '#EF4444', order: 1 },
    { id: 'priority-2', code: 'MEDIUM', displayName: '보통', displayNameEn: 'Medium', color: '#F59E0B', order: 2 },
    { id: 'priority-3', code: 'LOW', displayName: '낮음', displayNameEn: 'Low', color: '#10B981', order: 3 },
  ];
}

export function createServiceTypeMappings(): ServiceTypeMapping[] {
  return [
    { id: 'service-1', code: 'OEM', displayName: 'OEM', displayNameEn: 'OEM', description: '주문자 상표 부착 생산', order: 1 },
    { id: 'service-2', code: 'ODM', displayName: 'ODM', displayNameEn: 'ODM', description: '제조업체 개발 생산', order: 2 },
    { id: 'service-3', code: 'OBM', displayName: 'OBM', displayNameEn: 'OBM', description: '자체 브랜드 생산', order: 3 },
    { id: 'service-4', code: 'PRIVATE_LABEL', displayName: 'Private Label', displayNameEn: 'Private Label', description: '자체 상표 부착', order: 4 },
    { id: 'service-5', code: 'WHITE_LABEL', displayName: 'White Label', displayNameEn: 'White Label', description: '상표 없는 제품', order: 5 },
    { id: 'service-6', code: 'OTHER', displayName: '기타', displayNameEn: 'Other', description: '기타 서비스', order: 6 },
  ];
}

export function createProjectTypeMappings(): ProjectTypeMapping[] {
  return [
    { id: 'proj-type-1', code: 'MASTER', displayName: '대형', displayNameEn: 'Master', order: 1 },
    { id: 'proj-type-2', code: 'SUB', displayName: '소형', displayNameEn: 'Sub', order: 2 },
    { id: 'proj-type-3', code: 'TASK', displayName: '작업', displayNameEn: 'Task', order: 3 },
  ];
}