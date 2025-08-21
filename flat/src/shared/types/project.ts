// Re-export from centralized enums
export { 
  ProjectStatus, 
  ProjectType, 
  Priority, 
  ServiceType,
  DepositStatus 
} from './enums';

import { ProjectId, CustomerId, FactoryId, UserId } from './branded';
import { ProjectTaskChecklist } from './taskChecklist';

// Legacy type aliases - will be removed in future versions
export type ServiceTypeString = 'OEM' | 'ODM' | 'OBM' | 'Private Label' | 'White Label' | '기타';
export type ProjectStatusKorean = '시작전' | '진행중' | '완료' | '중단';
export type PriorityString = '높음' | '보통' | '낮음' | 'high' | 'medium' | 'low';

// Product type is currently a string - will be enum in future
export type ProductType = string;

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
  labNumber?: string; // 확정 랩넘버
  name: string;
  type: ProjectType;
  parentId?: ProjectId;
  status: ProjectStatus;
  customerId: CustomerId;
  customer: Customer;
  product: Product;
  productType: ProductType;
  serviceType: ServiceType;
  quantity: number;
  totalAmount: number;
  depositAmount: number;
  depositStatus: DepositStatus;
  depositPaid: boolean;
  startDate: Date;
  endDate: Date;
  manufacturerId: FactoryId | FactoryId[];
  containerId: FactoryId | FactoryId[];
  packagingId: FactoryId | FactoryId[];
  priority: Priority;
  progress: number;
  scheduleId: ProjectId; // Schedule ID is same as Project ID
  createdBy: UserId;
  managerId: UserId;
  createdAt: Date;
  updatedAt: Date;
  
  // UI computed/display fields - populated from relations
  client?: string; // customer.name
  manager?: string; // manager user name
  manufacturerName?: string | string[]; // manufacturer factory name(s)
  containerName?: string | string[]; // container factory name(s)
  packagingName?: string | string[]; // packaging factory name(s)
  currentStage?: string[]; // computed from tasks
  
  // Hierarchy fields for UI
  children?: Project[];
  isExpanded?: boolean;
  level?: number;

  // Project detail section data
  developmentRequest?: ProjectDevelopmentRequest;
  contentDetails?: ProjectContentDetails;
  containerDetails?: ProjectContainerDetails;
  designLabeling?: ProjectDesignLabeling;
  certification?: ProjectCertification;
  taskChecklist?: ProjectTaskChecklist;
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

// Project detail section interfaces
export interface ProjectDevelopmentRequest {
  requestDate: string;
  content: string;
  manager: string;
  companyName?: string;
  contactPerson?: string;
  contactNumber?: string;
  emailAddress?: string;
  sampleDeliveryAddress?: string;
}

export interface ProjectContentDetails {
  mainIngredients: string;
  volume: string;
  requiredIngredients?: string[];
  optionalIngredients?: string[];
  excludedIngredients?: string[];
}

export interface ProjectContainerDetails {
  containerType: string;
  material: string;
  color: string;
  sealingLabel?: string;
  unitBox?: string;
  design?: string;
}

export interface ProjectDesignLabeling {
  productName: string;
  labelInfo: string;
  isTemporaryName?: boolean;
  targetProductLink?: string;
  productConcept?: string;
  desiredFormulation?: string;
  desiredTexture?: string;
  fragrance?: string;
}

export interface ProjectCertification {
  status: string;
  expectedCompletion: string;
  exportCountry?: string;
  clinicalTrial?: string;
  functionalCertifications?: string[];
  desiredShelfLife?: string;
  forInfants?: string;
  otherCertifications?: string[];
}