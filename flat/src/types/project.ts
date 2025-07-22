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
  depositPaid?: boolean; // 선금입금 여부
  // 계층 구조를 위한 필드들
  type?: 'master' | 'sub' | 'task';
  parentId?: string;
  children?: Project[];
  isExpanded?: boolean;
  level?: number;
}

export type FactoryType = 'manufacturing' | 'container' | 'packaging';

export interface ProjectFactory {
  name: string;
  color: string;
  type?: FactoryType;
}

export interface EditingCell {
  projectId: string;
  field: string;
}