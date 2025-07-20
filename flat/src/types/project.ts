// Project related types
export type ServiceType = 'OEM' | 'ODM' | 'OBM' | 'Private Label' | 'White Label' | '기타';
export type ProjectStatus = '시작전' | '진행중' | '완료' | '중단';
export type Priority = '높음' | '보통' | '낮음';

export interface Project {
  id: string;
  client: string;
  manager: string;
  productType: string;
  serviceType: ServiceType;
  currentStage: string[];
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  manufacturer: string;
  container: string;
  packaging: string;
  sales: string;
  purchase: string;
  priority: Priority;
  scheduleId?: string; // 스케줄 ID 추가
}

export interface ProjectFactory {
  name: string;
  color: string;
}

export interface EditingCell {
  projectId: string;
  field: string;
}