// Re-export from centralized enums
export { 
  ProjectStatus, 
  ProjectType, 
  Priority, 
  ServiceType,
  DepositStatus 
} from './enums';

import { ProjectId, CustomerId, FactoryId, UserId } from './branded';

// Legacy type aliases - will be removed in future versions
export type ServiceTypeString = 'OEM' | 'ODM' | 'OBM' | 'Private Label' | 'White Label' | '기타';
export type ProjectStatusKorean = '시작전' | '진행중' | '완료' | '중단';
export type PriorityString = '높음' | '보통' | '낮음' | 'high' | 'medium' | 'low';

export interface Customer {
  id: CustomerId;
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
  id: ProjectId;
  projectNumber?: string;
  name: string;
  type: ProjectType;
  parentId?: ProjectId;
  status: ProjectStatus;
  customerId: CustomerId;
  customer: Customer;
  product: Product;
  quantity: number;
  totalAmount: number;
  depositAmount: number;
  depositStatus: DepositStatus;
  startDate: Date;
  endDate: Date;
  manufacturerId: FactoryId;
  containerId: FactoryId;
  packagingId: FactoryId;
  priority: Priority;
  progress: number;
  scheduleId: ProjectId; // Schedule ID is same as Project ID
  createdBy: UserId;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export FactoryType from enums
export { FactoryType } from './enums';

export interface ProjectFactory {
  id: FactoryId;
  name: string;
  color: string;
  type?: FactoryType;
}

export interface EditingCell {
  projectId: ProjectId;
  field: string;
}