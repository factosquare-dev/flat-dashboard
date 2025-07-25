/**
 * Mock Database Types and Interfaces
 * Provides comprehensive type definitions for the mock database system
 */

import type { User, UserRole } from '@/types/user';
import type { Factory } from '@/types/factory';
import type { Project, ProjectType, ProjectStatus } from '@/types/project';
import type { Schedule, Task } from '@/types/schedule';
import type { Comment } from '@/types/comment';
import type { Customer } from '@/types/customer';

/**
 * Database Collections
 */
export interface MockDatabase {
  users: Map<string, User>;
  customers: Map<string, Customer>;
  factories: Map<string, Factory>;
  projects: Map<string, Project>;
  schedules: Map<string, Schedule>;
  tasks: Map<string, Task>;
  comments: Map<string, Comment>;
  
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
}

/**
 * Relationship Models
 */
export interface UserFactory {
  id: string;
  userId: string;
  factoryId: string;
  role: 'manager' | 'operator' | 'viewer';
  assignedAt: Date;
  assignedBy: string;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  userId: string;
  role: 'manager' | 'member' | 'viewer';
  assignedAt: Date;
  assignedBy: string;
}

export interface FactoryProject {
  id: string;
  projectId: string;
  factoryId: string;
  factoryType: 'manufacturer' | 'container' | 'packaging';
  isPrimary: boolean;
  assignedAt: Date;
}

export interface UserCustomer {
  id: string;
  userId: string;
  customerId: string;
  role: 'manager' | 'sales' | 'support';
  assignedAt: Date;
  assignedBy: string;
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
export type DbEventType = 'created' | 'updated' | 'deleted' | 'connected' | 'disconnected';

export interface DbEvent {
  type: DbEventType;
  collection: keyof MockDatabase;
  id?: string;
  data?: any;
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