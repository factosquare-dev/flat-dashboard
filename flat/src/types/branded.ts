/**
 * Branded Types for Type Safety
 * Following "Fail Fast, Fail Loud" principle
 * 
 * Branded types ensure that IDs are not just strings,
 * but have semantic meaning and type safety
 */

// Branded type helper
type Brand<K, T> = K & { __brand: T };

// ID Types
export type FactoryId = Brand<string, 'FactoryId'>;
export type ProjectId = Brand<string, 'ProjectId'>;
export type UserId = Brand<string, 'UserId'>;
export type TaskId = Brand<string, 'TaskId'>;
export type CustomerId = Brand<string, 'CustomerId'>;

// Type Guards
export const isFactoryId = (value: unknown): value is FactoryId => {
  return typeof value === 'string' && /^(factory-|mfg-|cont-|pack-)[a-zA-Z0-9]+$/.test(value);
};

export const isProjectId = (value: unknown): value is ProjectId => {
  return typeof value === 'string' && /^(project-|proj-)[a-zA-Z0-9-]+$/.test(value);
};

export const isUserId = (value: unknown): value is UserId => {
  return typeof value === 'string' && /^(user-|usr-)[a-zA-Z0-9]+$/.test(value);
};

export const isTaskId = (value: unknown): value is TaskId => {
  return typeof value === 'string' && /^(task-)[a-zA-Z0-9-]+$/.test(value);
};

export const isCustomerId = (value: unknown): value is CustomerId => {
  return typeof value === 'string' && /^(customer-|cust-)[a-zA-Z0-9]+$/.test(value);
};

// Safe conversion functions - Fail Fast, Fail Loud
export const toFactoryId = (value: string): FactoryId => {
  if (!isFactoryId(value)) {
    throw new Error(`Invalid factory ID format: "${value}". Expected format: factory-*, mfg-*, cont-*, or pack-*`);
  }
  return value as FactoryId;
};

export const toProjectId = (value: string): ProjectId => {
  if (!isProjectId(value)) {
    throw new Error(`Invalid project ID format: "${value}". Expected format: project-* or proj-*`);
  }
  return value as ProjectId;
};

export const toUserId = (value: string): UserId => {
  if (!isUserId(value)) {
    throw new Error(`Invalid user ID format: "${value}". Expected format: user-* or usr-*`);
  }
  return value as UserId;
};

export const toTaskId = (value: string): TaskId => {
  if (!isTaskId(value)) {
    throw new Error(`Invalid task ID format: "${value}". Expected format: task-*`);
  }
  return value as TaskId;
};

export const toCustomerId = (value: string): CustomerId => {
  if (!isCustomerId(value)) {
    throw new Error(`Invalid customer ID format: "${value}". Expected format: customer-* or cust-*`);
  }
  return value as CustomerId;
};

// Safe conversion with fallback (for migration period)
export const toFactoryIdSafe = (value: string | undefined): FactoryId | undefined => {
  if (!value) return undefined;
  try {
    return toFactoryId(value);
  } catch {
    console.warn(`Invalid factory ID: ${value}`);
    return undefined;
  }
};

export const toProjectIdSafe = (value: string | undefined): ProjectId | undefined => {
  if (!value) return undefined;
  try {
    return toProjectId(value);
  } catch {
    console.warn(`Invalid project ID: ${value}`);
    return undefined;
  }
};

export const toUserIdSafe = (value: string | undefined): UserId | undefined => {
  if (!value) return undefined;
  try {
    return toUserId(value);
  } catch {
    console.warn(`Invalid user ID: ${value}`);
    return undefined;
  }
};

export const toTaskIdSafe = (value: string | undefined): TaskId | undefined => {
  if (!value) return undefined;
  try {
    return toTaskId(value);
  } catch {
    console.warn(`Invalid task ID: ${value}`);
    return undefined;
  }
};

export const toCustomerIdSafe = (value: string | undefined): CustomerId | undefined => {
  if (!value) return undefined;
  try {
    return toCustomerId(value);
  } catch {
    console.warn(`Invalid customer ID: ${value}`);
    return undefined;
  }
};

// Utility functions for working with branded types
export const extractIdString = <T extends string>(brandedId: Brand<string, T>): string => {
  return brandedId as string;
};

// ProductCategory ID branded type
export type ProductCategoryId = Brand<string, 'ProductCategoryId'>;

// Product ID branded type
export type ProductId = Brand<string, 'ProductId'>;

// Validation error classes
export class InvalidFactoryIdError extends Error {
  constructor(value: string) {
    super(`Invalid factory ID: ${value}`);
    this.name = 'InvalidFactoryIdError';
  }
}

export class InvalidProjectIdError extends Error {
  constructor(value: string) {
    super(`Invalid project ID: ${value}`);
    this.name = 'InvalidProjectIdError';
  }
}

export class InvalidUserIdError extends Error {
  constructor(value: string) {
    super(`Invalid user ID: ${value}`);
    this.name = 'InvalidUserIdError';
  }
}

export class InvalidTaskIdError extends Error {
  constructor(value: string) {
    super(`Invalid task ID: ${value}`);
    this.name = 'InvalidTaskIdError';
  }
}

export class InvalidCustomerIdError extends Error {
  constructor(value: string) {
    super(`Invalid customer ID: ${value}`);
    this.name = 'InvalidCustomerIdError';
  }
}

// ID Generation Functions
export const generateFactoryId = (type: 'manufacturing' | 'container' | 'packaging' = 'manufacturing'): FactoryId => {
  const prefix = type === 'manufacturing' ? 'mfg' : type === 'container' ? 'cont' : 'pack';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return toFactoryId(`${prefix}-${timestamp}-${random}`);
};

export const generateProjectId = (): ProjectId => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return toProjectId(`proj-${timestamp}-${random}`);
};

export const generateUserId = (): UserId => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return toUserId(`user-${timestamp}-${random}`);
};

export const generateTaskId = (): TaskId => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return toTaskId(`task-${timestamp}-${random}`);
};

export const generateCustomerId = (): CustomerId => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return toCustomerId(`cust-${timestamp}-${random}`);
};

// ProductCategory ID functions
export const isProductCategoryId = (value: unknown): value is ProductCategoryId => {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value);
};

export const toProductCategoryId = (value: string): ProductCategoryId => {
  if (!isProductCategoryId(value)) {
    throw new Error(`Invalid product category ID format: "${value}". Expected format: numeric string`);
  }
  return value as ProductCategoryId;
};

export const toProductCategoryIdSafe = (value: string | undefined): ProductCategoryId | undefined => {
  if (!value) return undefined;
  try {
    return toProductCategoryId(value);
  } catch {
    console.warn(`Invalid product category ID: ${value}`);
    return undefined;
  }
};

// Product ID functions  
export const isProductId = (value: unknown): value is ProductId => {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value);
};

export const toProductId = (value: string): ProductId => {
  if (!isProductId(value)) {
    throw new Error(`Invalid product ID format: "${value}". Expected format: numeric string`);
  }
  return value as ProductId;
};

export const toProductIdSafe = (value: string | undefined): ProductId | undefined => {
  if (!value) return undefined;
  try {
    return toProductId(value);
  } catch {
    console.warn(`Invalid product ID: ${value}`);
    return undefined;
  }
};

// 자동 증가하는 ID 생성을 위한 카운터들
export const generateProductCategoryId = (): ProductCategoryId => {
  // window 객체에서 카운터 관리 (브라우저 환경에서만)
  if (typeof window !== 'undefined') {
    if (!(window as any).__productCategoryIdCounter) {
      (window as any).__productCategoryIdCounter = 1000;
    }
    return toProductCategoryId((++(window as any).__productCategoryIdCounter).toString());
  }
  
  // 서버 환경에서는 랜덤 ID 생성
  return toProductCategoryId(Math.floor(Math.random() * 1000000).toString());
};

export const generateProductId = (): ProductId => {
  // window 객체에서 카운터 관리 (브라우저 환경에서만)
  if (typeof window !== 'undefined') {
    if (!(window as any).__productIdCounter) {
      (window as any).__productIdCounter = 2000;
    }
    return toProductId((++(window as any).__productIdCounter).toString());
  }
  
  // 서버 환경에서는 랜덤 ID 생성
  return toProductId(Math.floor(Math.random() * 1000000).toString());
};