/**
 * API Response Conversion Utilities
 * Convert API responses to use branded types
 */

import {
  FactoryId,
  ProjectId,
  UserId,
  TaskId,
  CustomerId,
  toFactoryId,
  toProjectId,
  toUserId,
  toTaskId,
  toCustomerId,
  toFactoryIdSafe,
  toProjectIdSafe,
  toUserIdSafe,
  toTaskIdSafe,
  toCustomerIdSafe
} from '../types/branded';
import type { Factory } from '../types/factory';
import type { Project } from '../types/project';
import type { User } from '../types/user';
import type { Task } from '../types/schedule';
import type { Customer } from '../types/customer';

/**
 * Convert raw API factory response to typed Factory
 */
export const convertApiFactory = (raw: any): Factory => {
  return {
    ...raw,
    id: toFactoryId(raw.id)
  };
};

/**
 * Convert raw API project response to typed Project
 */
export const convertApiProject = (raw: any): Project => {
  return {
    ...raw,
    id: toProjectId(raw.id),
    parentId: raw.parentId ? toProjectIdSafe(raw.parentId) : undefined,
    customerId: toCustomerId(raw.customerId),
    manufacturerId: toFactoryId(raw.manufacturerId),
    containerId: toFactoryId(raw.containerId),
    packagingId: toFactoryId(raw.packagingId),
    scheduleId: toProjectId(raw.scheduleId || raw.id), // Schedule ID is same as Project ID
    createdBy: toUserId(raw.createdBy),
    // Convert date strings to Date objects
    startDate: new Date(raw.startDate),
    endDate: new Date(raw.endDate),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt)
  };
};

/**
 * Convert raw API user response to typed User
 */
export const convertApiUser = (raw: any): User => {
  return {
    ...raw,
    id: toUserId(raw.id)
  };
};

/**
 * Convert raw API task response to typed Task
 */
export const convertApiTask = (raw: any): Task => {
  return {
    ...raw,
    id: toTaskId(raw.id),
    scheduleId: toProjectId(raw.scheduleId),
    factoryId: raw.factoryId ? toFactoryIdSafe(raw.factoryId) : undefined,
    approvedBy: raw.approvedBy ? toUserIdSafe(raw.approvedBy) : undefined,
    dependsOn: (raw.dependsOn ?? []).map((id: string) => toTaskId(id)),
    blockedBy: (raw.blockedBy ?? []).map((id: string) => toTaskId(id)),
    participants: (raw.participants ?? []).map((p: any) => ({
      ...p,
      userId: toUserId(p.userId)
    })),
    // Convert date strings to Date objects
    startDate: new Date(raw.startDate),
    endDate: new Date(raw.endDate),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    completedAt: raw.completedAt ? new Date(raw.completedAt) : undefined,
    approvedAt: raw.approvedAt ? new Date(raw.approvedAt) : undefined
  };
};

/**
 * Convert raw API customer response to typed Customer
 */
export const convertApiCustomer = (raw: any): Customer => {
  return {
    ...raw,
    id: toCustomerId(raw.id),
    createdBy: raw.createdBy ? toUserIdSafe(raw.createdBy) : undefined,
    // Convert date strings to Date objects
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt)
  };
};

/**
 * Convert arrays of API responses
 */
export const convertApiFactories = (raw: any[]): Factory[] => {
  return raw.map(convertApiFactory);
};

export const convertApiProjects = (raw: any[]): Project[] => {
  return raw.map(convertApiProject);
};

export const convertApiUsers = (raw: any[]): User[] => {
  return raw.map(convertApiUser);
};

export const convertApiTasks = (raw: any[]): Task[] => {
  return raw.map(convertApiTask);
};

export const convertApiCustomers = (raw: any[]): Customer[] => {
  return raw.map(convertApiCustomer);
};

/**
 * Extract string IDs for API requests
 */
export const extractIdForApi = (id: FactoryId | ProjectId | UserId | TaskId | CustomerId): string => {
  return id as string;
};

/**
 * Extract array of string IDs for API requests
 */
export const extractIdsForApi = (ids: Array<FactoryId | ProjectId | UserId | TaskId | CustomerId>): string[] => {
  return ids.map(id => id as string);
};