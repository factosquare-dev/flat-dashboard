/**
 * API Response Type Definitions
 * These types represent the raw data structures returned from the backend API
 */

import { 
  FactoryType, 
  ProjectStatus, 
  ProjectType, 
  Priority, 
  ServiceType, 
  TaskStatus, 
  TaskType, 
  ParticipantRole,
  CertificateType,
  UserRole
} from './enums';

/**
 * Common API response fields
 */
interface ApiTimestamps {
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * API Factory Response
 */
export interface ApiFactoryResponse extends ApiTimestamps {
  id: string;
  name: string;
  type: FactoryType | string; // Backend might send string
  address: string;
  contactNumber: string;
  manager: {
    name: string;
    phone: string;
    email: string;
  };
  capacity: number;
  certifications?: CertificateType[];
  establishedDate?: string; // ISO date string
  isActive: boolean;
  description?: string;
}

/**
 * API Project Response
 */
export interface ApiProjectResponse extends ApiTimestamps {
  id: string;
  parentId?: string;
  customerId: string;
  client: string;
  type: ProjectType | string;
  status: ProjectStatus | string;
  priority: Priority | string;
  name: string;
  productType: string;
  manager: string;
  serviceType: ServiceType | string;
  progress: number;
  manufacturerId: string;
  containerId: string;
  packagingId: string;
  scheduleId?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  sales: number;
  purchase: number;
  level?: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  children?: ApiProjectResponse[];
  deposit?: number;
  depositDate?: string;
  createdBy: string;
  isVisible?: boolean;
  notes?: string;
}

/**
 * API User Response
 */
export interface ApiUserResponse extends ApiTimestamps {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  department?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string; // ISO date string
}

/**
 * API Task Participant
 */
export interface ApiTaskParticipant {
  userId: string;
  role: ParticipantRole | string;
}

/**
 * API Task Response
 */
export interface ApiTaskResponse extends ApiTimestamps {
  id: string;
  scheduleId: string;
  title: string;
  type: TaskType | string;
  status: TaskStatus | string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  progress: number;
  participants: ApiTaskParticipant[];
  factoryId?: string;
  priority: Priority | string;
  dependsOn: string[];
  blockedBy: string[];
  notes?: string;
  completedAt?: string; // ISO date string
  approvedBy?: string;
  approvedAt?: string; // ISO date string
  rejectionReason?: string;
  
  // Legacy fields from MockTask (if still used by backend)
  projectId?: string;
  name?: string;
  assigneeId?: string;
  assignee?: string;
}

/**
 * API Customer Response
 */
export interface ApiCustomerResponse extends ApiTimestamps {
  id: string;
  name: string;
  companyName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdBy?: string;
}

/**
 * API Schedule Response
 */
export interface ApiScheduleResponse extends ApiTimestamps {
  id: string;
  projectId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: 'draft' | 'active' | 'completed' | 'archived';
  factories?: ApiFactoryResponse[];
  tasks?: ApiTaskResponse[];
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  path: string;
}

/**
 * API Paginated Response
 */
export interface ApiPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * API Batch Operation Response
 */
export interface ApiBatchResponse {
  success: boolean;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
  message?: string;
}