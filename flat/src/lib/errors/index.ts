/**
 * Custom Error Classes for FLAT Dashboard
 * Following "Fail Fast, Fail Loud" principle
 * 
 * These errors provide clear, actionable messages
 * and help with debugging and error tracking
 */

// Error detail types
export interface ErrorDetails {
  [key: string]: unknown;
}

// Base error class for all FLAT errors
export class FlatError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: ErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Factory related errors
export class FactoryNotFoundError extends FlatError {
  constructor(id: string) {
    super(
      `Factory with id "${id}" not found`,
      'FACTORY_NOT_FOUND',
      404,
      { factoryId: id }
    );
  }
}

export class InvalidFactoryDataError extends FlatError {
  constructor(message: string, data?: unknown) {
    super(
      message,
      'INVALID_FACTORY_DATA',
      400,
      { data }
    );
  }
}

// Project related errors
export class ProjectNotFoundError extends FlatError {
  constructor(id: string) {
    super(
      `Project with id "${id}" not found`,
      'PROJECT_NOT_FOUND',
      404,
      { projectId: id }
    );
  }
}

export class InvalidProjectStatusError extends FlatError {
  constructor(status: string, validStatuses: string[]) {
    super(
      `Invalid project status "${status}". Valid statuses are: ${validStatuses.join(', ')}`,
      'INVALID_PROJECT_STATUS',
      400,
      { status, validStatuses }
    );
  }
}

// User related errors
export class UserNotFoundError extends FlatError {
  constructor(id: string) {
    super(
      `User with id "${id}" not found`,
      'USER_NOT_FOUND',
      404,
      { userId: id }
    );
  }
}

export class UnauthorizedError extends FlatError {
  constructor(message: string = 'Unauthorized access') {
    super(
      message,
      'UNAUTHORIZED',
      401
    );
  }
}

// Validation errors
export class ValidationError extends FlatError {
  constructor(field: string, message: string, value?: unknown) {
    super(
      `Validation error for field "${field}": ${message}`,
      'VALIDATION_ERROR',
      400,
      { field, value }
    );
  }
}

export class RequiredFieldError extends ValidationError {
  constructor(field: string) {
    super(field, 'This field is required');
  }
}

// Data consistency errors
export class DataIntegrityError extends FlatError {
  constructor(message: string, details?: ErrorDetails) {
    super(
      message,
      'DATA_INTEGRITY_ERROR',
      500,
      details
    );
  }
}

export class DuplicateError extends FlatError {
  constructor(entity: string, field: string, value: string) {
    super(
      `${entity} with ${field} "${value}" already exists`,
      'DUPLICATE_ERROR',
      409,
      { entity, field, value }
    );
  }
}

// Network and API errors
export class NetworkError extends FlatError {
  constructor(message: string = 'Network request failed') {
    super(
      message,
      'NETWORK_ERROR',
      0
    );
  }
}

// API Response type
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

export class ApiError extends FlatError {
  constructor(message: string, statusCode: number, response?: ApiErrorResponse) {
    super(
      message,
      'API_ERROR',
      statusCode,
      { response }
    );
  }
}

// Error utility functions
export const isNotFoundError = (error: unknown): boolean => {
  return error instanceof FlatError && error.statusCode === 404;
};

export const isValidationError = (error: unknown): boolean => {
  return error instanceof ValidationError;
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof NetworkError || 
    (error instanceof Error && error.message.includes('network'));
};

// Error handler for consistent error logging
export const handleError = (error: unknown, context?: string): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorDetails = error instanceof FlatError ? error.details : undefined;
  
  console.error(`[${context || 'Error'}]:`, errorMessage, errorDetails);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry/LogRocket/etc
  }
};

// Assert functions for fail-fast validation
export const assertDefined = <T>(
  value: T | undefined | null,
  message: string
): asserts value is T => {
  if (value === undefined || value === null) {
    throw new ValidationError('value', message, value);
  }
};

export const assertValidId = (
  id: string | undefined,
  entity: string
): asserts id is string => {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new ValidationError('id', `Invalid ${entity} ID`, id);
  }
};

export const assertValidEnum = <T extends string>(
  value: string,
  enumObj: Record<string, T>,
  fieldName: string
): asserts value is T => {
  if (!Object.values(enumObj).includes(value as T)) {
    throw new ValidationError(
      fieldName,
      `Invalid value. Must be one of: ${Object.values(enumObj).join(', ')}`,
      value
    );
  }
};