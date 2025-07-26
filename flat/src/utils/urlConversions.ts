/**
 * URL Parameter Conversion Utilities
 * Convert URL parameters to/from branded types
 */

import {
  FactoryId,
  ProjectId,
  UserId,
  TaskId,
  CustomerId,
  toFactoryIdSafe,
  toProjectIdSafe,
  toUserIdSafe,
  toTaskIdSafe,
  toCustomerIdSafe,
  extractIdString
} from '../types/branded';

/**
 * Extract ID from URL parameter
 */
export const getFactoryIdFromUrl = (param: string | null | undefined): FactoryId | undefined => {
  if (!param) return undefined;
  return toFactoryIdSafe(param);
};

export const getProjectIdFromUrl = (param: string | null | undefined): ProjectId | undefined => {
  if (!param) return undefined;
  return toProjectIdSafe(param);
};

export const getUserIdFromUrl = (param: string | null | undefined): UserId | undefined => {
  if (!param) return undefined;
  return toUserIdSafe(param);
};

export const getTaskIdFromUrl = (param: string | null | undefined): TaskId | undefined => {
  if (!param) return undefined;
  return toTaskIdSafe(param);
};

export const getCustomerIdFromUrl = (param: string | null | undefined): CustomerId | undefined => {
  if (!param) return undefined;
  return toCustomerIdSafe(param);
};

/**
 * Convert branded ID to URL parameter
 */
export const factoryIdToUrl = (id: FactoryId): string => {
  return extractIdString(id);
};

export const projectIdToUrl = (id: ProjectId): string => {
  return extractIdString(id);
};

export const userIdToUrl = (id: UserId): string => {
  return extractIdString(id);
};

export const taskIdToUrl = (id: TaskId): string => {
  return extractIdString(id);
};

export const customerIdToUrl = (id: CustomerId): string => {
  return extractIdString(id);
};

/**
 * Parse query string with branded types
 */
export interface ParsedUrlParams {
  projectId?: ProjectId;
  factoryId?: FactoryId;
  userId?: UserId;
  taskId?: TaskId;
  customerId?: CustomerId;
}

export const parseUrlParams = (searchParams: URLSearchParams): ParsedUrlParams => {
  return {
    projectId: getProjectIdFromUrl(searchParams.get('projectId')),
    factoryId: getFactoryIdFromUrl(searchParams.get('factoryId')),
    userId: getUserIdFromUrl(searchParams.get('userId')),
    taskId: getTaskIdFromUrl(searchParams.get('taskId')),
    customerId: getCustomerIdFromUrl(searchParams.get('customerId'))
  };
};

/**
 * Build URL search params from branded types
 */
export const buildUrlParams = (params: ParsedUrlParams): URLSearchParams => {
  const searchParams = new URLSearchParams();
  
  if (params.projectId) {
    searchParams.set('projectId', projectIdToUrl(params.projectId));
  }
  if (params.factoryId) {
    searchParams.set('factoryId', factoryIdToUrl(params.factoryId));
  }
  if (params.userId) {
    searchParams.set('userId', userIdToUrl(params.userId));
  }
  if (params.taskId) {
    searchParams.set('taskId', taskIdToUrl(params.taskId));
  }
  if (params.customerId) {
    searchParams.set('customerId', customerIdToUrl(params.customerId));
  }
  
  return searchParams;
};

/**
 * React Router param helpers
 */
export const useFactoryIdParam = (param: string | undefined): FactoryId | undefined => {
  return getFactoryIdFromUrl(param);
};

export const useProjectIdParam = (param: string | undefined): ProjectId | undefined => {
  return getProjectIdFromUrl(param);
};

export const useUserIdParam = (param: string | undefined): UserId | undefined => {
  return getUserIdFromUrl(param);
};

export const useTaskIdParam = (param: string | undefined): TaskId | undefined => {
  return getTaskIdFromUrl(param);
};

export const useCustomerIdParam = (param: string | undefined): CustomerId | undefined => {
  return getCustomerIdFromUrl(param);
};