/**
 * Mock Database Types and Interfaces
 * Provides comprehensive type definitions for the mock database system
 */

import type { User, UserRole } from '@/shared/types/user';
import type { Factory } from '@/shared/types/factory';
import type { Project, ProjectType, ProjectStatus } from '@/shared/types/project';
import type { Schedule, Task } from '@/shared/types/schedule';
import type { Comment } from '@/shared/types/comment';
import type { Customer } from '@/shared/types/customer';
import type { ProductCategory, ProductCategoryId } from '@/shared/types/productCategory';
import type { Product, ProductId } from '@/shared/types/product';
import type { UserId, FactoryId, ProjectId, TaskId, CustomerId } from '@/shared/types/branded';
import type { CustomFieldDefinition, CustomFieldValue, CustomFieldGroup, CustomFieldTemplate } from '@/shared/types/customField';

/**
 * Database Collections
 */
export interface MockDatabase {
  users: Map<UserId, User>;
  customers: Map<CustomerId, Customer>;
  factories: Map<FactoryId, Factory>;
  projects: Map<ProjectId, Project>;
  schedules: Map<ProjectId, Schedule>;
  tasks: Map<TaskId, Task>;
  comments: Map<string, Comment>;
  productCategories: Map<ProductCategoryId, ProductCategory>;
  products: Map<ProductId, Product>;
  
  // Relationship tables
  userFactories: Map<string, UserFactory>;
  projectAssignments: Map<string, ProjectAssignment>;
  factoryProjects: Map<string, FactoryProject>;
  userCustomers: Map<string, UserCustomer>;
  
  // Configuration tables
  statusMappings: Map<string, StatusMapping>;
  priorityMappings: Map<string, PriorityMapping>;
  serviceTypeMappings: Map<string, ServiceTypeMapping>;
  projectTypeMappings: Map<string, ProjectTypeMapping>;
  
  // Custom Fields System
  customFieldDefinitions: Map<string, CustomFieldDefinition>;
  customFieldValues: Map<string, CustomFieldValue>;
  customFieldGroups: Map<string, CustomFieldGroup>;
  customFieldTemplates: Map<string, CustomFieldTemplate>;
  
  // UI Settings
  uiSettings: Map<string, UISettings>;
}

/**
 * Relationship Models
 */
export interface UserFactory {
  id: string;
  userId: UserId;
  factoryId: FactoryId;
  role: 'manager' | 'operator' | 'viewer';
  assignedAt: Date;
  assignedBy: UserId;
}

export interface ProjectAssignment {
  id: string;
  projectId: ProjectId;
  userId: UserId;
  role: 'manager' | 'member' | 'viewer';
  assignedAt: Date;
  assignedBy: UserId;
}

export interface FactoryProject {
  id: string;
  projectId: ProjectId;
  factoryId: FactoryId;
  factoryType: 'manufacturer' | 'container' | 'packaging';
  isPrimary: boolean;
  assignedAt: Date;
}

export interface UserCustomer {
  id: string;
  userId: UserId;
  customerId: CustomerId;
  role: 'manager' | 'sales' | 'support';
  assignedAt: Date;
  assignedBy: UserId;
}

/**
 * Configuration Models
 */
export interface StatusMapping {
  id: string;
  type: 'project' | 'task';
  code: string;
  displayName: string;
  displayNameEn?: string;
  color?: string;
  order: number;
}

export interface PriorityMapping {
  id: string;
  code: string;
  displayName: string;
  displayNameEn?: string;
  color?: string;
  order: number;
}

export interface ServiceTypeMapping {
  id: string;
  code: string;
  displayName: string;
  displayNameEn?: string;
  description?: string;
  order: number;
}

export interface ProjectTypeMapping {
  id: string;
  code: string;
  displayName: string;
  displayNameEn?: string;
  order: number;
}

/**
 * UI Settings Models
 */
export interface UISettings {
  id: string;
  userId: UserId;
  component: string; // e.g., 'ProjectList', 'Schedule'
  settings: {
    columnOrder?: string[];
    columnWidths?: Record<string, number>;
    hiddenColumns?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
    viewMode?: string;
    other?: Record<string, any>;
  };
  updatedAt: Date;
}

/**
 * Query Options
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * Query Result
 */
export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Database Operations Response
 */
export interface DbResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Database Transaction
 */
export interface DbTransaction {
  id: string;
  operations: DbOperation[];
  status: 'pending' | 'committed' | 'rolled-back';
  timestamp: Date;
}

// Database collection names as constants
export const DB_COLLECTIONS = {
  USERS: 'users',
  CUSTOMERS: 'customers',
  FACTORIES: 'factories',
  PROJECTS: 'projects',
  SCHEDULES: 'schedules',
  TASKS: 'tasks',
  COMMENTS: 'comments',
  PRODUCT_CATEGORIES: 'productCategories',
  PRODUCTS: 'products',
  USER_FACTORIES: 'userFactories',
  PROJECT_ASSIGNMENTS: 'projectAssignments',
  FACTORY_PROJECTS: 'factoryProjects',
  USER_CUSTOMERS: 'userCustomers',
  STATUS_MAPPINGS: 'statusMappings',
  PRIORITY_MAPPINGS: 'priorityMappings',
  SERVICE_TYPE_MAPPINGS: 'serviceTypeMappings',
  PROJECT_TYPE_MAPPINGS: 'projectTypeMappings',
  UI_SETTINGS: 'uiSettings'
} as const;

export type DbCollectionName = keyof MockDatabase;

export interface DbOperation {
  type: 'create' | 'update' | 'delete';
  collection: keyof MockDatabase;
  id: string;
  data?: any;
  previousData?: any;
}

/**
 * Database Events
 */
export enum DbEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

export interface DbEvent {
  type: DbEventType;
  collection: keyof MockDatabase;
  id?: string;
  data?: any;
  previousData?: any;
  timestamp: Date;
  userId?: string;
}

/**
 * Database Statistics
 */
export interface DbStats {
  collections: {
    [K in keyof MockDatabase]: {
      count: number;
      lastModified: Date;
    };
  };
  relationships: {
    userFactories: number;
    projectAssignments: number;
    factoryProjects: number;
    userCustomers: number;
  };
  configurations: {
    statusMappings: number;
    priorityMappings: number;
    serviceTypeMappings: number;
    projectTypeMappings: number;
  };
  totalSize: number;
  version: string;
}