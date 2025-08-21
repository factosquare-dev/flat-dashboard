import type { Project, Customer } from '@/shared/types/project';
import type { ApiResponse } from '@/shared/types/api';
import { 
  toProjectId, 
  toCustomerId, 
  toFactoryId, 
  toUserId,
  toProjectIdSafe,
  toCustomerIdSafe,
  toFactoryIdSafe,
  toUserIdSafe
} from '@/shared/types/branded';
import { ProjectType, ProjectStatus, Priority, DepositStatus } from '@/shared/types/enums';

// API Response interfaces (what we receive from the backend)
interface ApiProject {
  id: string;
  project_number?: string;
  name: string;
  type: string;
  parent_id?: string;
  status: string;
  customer_id: string;
  customer: ApiCustomer;
  product: ApiProduct;
  quantity: number;
  total_amount: number;
  deposit_amount: number;
  deposit_status: string;
  start_date: string;
  end_date: string;
  manufacturer_id: string;
  container_id: string;
  packaging_id: string;
  priority: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

interface ApiCustomer {
  id: string;
  name: string;
  contact_person: string;
  contact_number: string;
  email: string;
}

interface ApiProduct {
  name: string;
  volume: string;
  unit_price: number;
}

/**
 * Transform API project response to domain model with branded types
 */
export function transformApiProject(apiProject: ApiProject): Project {
  return {
    id: toProjectId(apiProject.id),
    projectNumber: apiProject.project_number,
    name: apiProject.name,
    type: apiProject.type as ProjectType,
    parentId: apiProject.parent_id ? toProjectIdSafe(apiProject.parent_id) : undefined,
    status: apiProject.status as ProjectStatus,
    customerId: toCustomerId(apiProject.customer_id),
    customer: transformApiCustomer(apiProject.customer),
    product: {
      name: apiProject.product.name,
      volume: apiProject.product.volume,
      unitPrice: apiProject.product.unit_price
    },
    quantity: apiProject.quantity,
    totalAmount: apiProject.total_amount,
    depositAmount: apiProject.deposit_amount,
    depositStatus: apiProject.deposit_status as DepositStatus,
    startDate: new Date(apiProject.start_date),
    endDate: new Date(apiProject.end_date),
    manufacturerId: toFactoryId(apiProject.manufacturer_id),
    containerId: toFactoryId(apiProject.container_id),
    packagingId: toFactoryId(apiProject.packaging_id),
    priority: apiProject.priority as Priority,
    createdBy: toUserId(apiProject.created_by),
    updatedBy: apiProject.updated_by ? toUserIdSafe(apiProject.updated_by) : undefined,
    createdAt: new Date(apiProject.created_at),
    updatedAt: new Date(apiProject.updated_at),
    
    // Computed fields (these should be calculated on the frontend)
    progress: 0,
    client: apiProject.customer.name,
    productType: apiProject.product.name,
    manufacturer: '', // Should be populated from factory data
    container: '', // Should be populated from factory data
    packaging: '', // Should be populated from factory data
    serviceType: 'OEM' // Default, should be calculated based on business logic
  };
}

/**
 * Transform API customer response to domain model
 */
function transformApiCustomer(apiCustomer: ApiCustomer): Customer {
  return {
    id: toCustomerId(apiCustomer.id),
    name: apiCustomer.name,
    contactPerson: apiCustomer.contact_person,
    contactNumber: apiCustomer.contact_number,
    email: apiCustomer.email
  };
}

/**
 * Transform domain model to API request format
 */
export function transformProjectToApi(project: Partial<Project>): Partial<ApiProject> {
  const apiProject: Partial<ApiProject> = {};
  
  if (project.id) apiProject.id = project.id;
  if (project.projectNumber) apiProject.project_number = project.projectNumber;
  if (project.name) apiProject.name = project.name;
  if (project.type) apiProject.type = project.type;
  if (project.parentId) apiProject.parent_id = project.parentId;
  if (project.status) apiProject.status = project.status;
  if (project.customerId) apiProject.customer_id = project.customerId;
  if (project.quantity !== undefined) apiProject.quantity = project.quantity;
  if (project.totalAmount !== undefined) apiProject.total_amount = project.totalAmount;
  if (project.depositAmount !== undefined) apiProject.deposit_amount = project.depositAmount;
  if (project.depositStatus) apiProject.deposit_status = project.depositStatus;
  if (project.startDate) apiProject.start_date = project.startDate.toISOString();
  if (project.endDate) apiProject.end_date = project.endDate.toISOString();
  if (project.manufacturerId) apiProject.manufacturer_id = project.manufacturerId;
  if (project.containerId) apiProject.container_id = project.containerId;
  if (project.packagingId) apiProject.packaging_id = project.packagingId;
  if (project.priority) apiProject.priority = project.priority;
  
  if (project.product) {
    apiProject.product = {
      name: project.product.name,
      volume: project.product.volume,
      unit_price: project.product.unitPrice
    };
  }
  
  return apiProject;
}

/**
 * Transform paginated API response
 */
export function transformApiProjectList(response: ApiResponse<ApiProject[]>): ApiResponse<Project[]> {
  if (!response.success || !response.data) {
    return response as ApiResponse<Project[]>;
  }
  
  return {
    ...response,
    data: response.data.map(transformApiProject)
  };
}

/**
 * Validate and transform project ID from API
 */
export function validateApiProjectId(id: unknown): string {
  if (typeof id !== 'string') {
    throw new Error(`Invalid project ID type: ${typeof id}`);
  }
  
  // Validate the ID format
  const projectId = toProjectIdSafe(id);
  if (!projectId) {
    throw new Error(`Invalid project ID format: ${id}`);
  }
  
  return projectId;
}