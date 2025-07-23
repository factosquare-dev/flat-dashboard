// Project related types
export type ServiceType = 'OEM' | 'ODM' | 'OBM' | 'Private Label' | 'White Label' | '기타';

// Export enums for better type safety
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum ProjectType {
  MASTER = 'MASTER',
  SUB = 'SUB',
  TASK = 'TASK',
}

// Support both Korean and English status for backward compatibility
export type ProjectStatusKorean = '시작전' | '진행중' | '완료' | '중단';
export type Priority = '높음' | '보통' | '낮음' | 'high' | 'medium' | 'low';

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
}

export interface Product {
  name: string;
  volume: string;
  unitPrice: number;
}

export interface Project {
  id: string;
  projectNumber?: string;
  name: string;
  type: ProjectType;
  parentId?: string;
  status: ProjectStatus;
  customer: Customer;
  product: Product;
  quantity: number;
  totalAmount: number;
  depositAmount: number;
  depositStatus: 'pending' | 'received' | 'refunded';
  startDate: Date;
  endDate: Date;
  manufacturerId: string;
  containerId: string;
  packagingId: string;
  priority: Priority;
  progress: number;
  scheduleId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields for backward compatibility
  client?: string;
  manager?: string;
  productType?: string;
  serviceType?: ServiceType;
  currentStage?: string[];
  manufacturer?: string;
  container?: string;
  packaging?: string;
  depositPaid?: boolean;
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