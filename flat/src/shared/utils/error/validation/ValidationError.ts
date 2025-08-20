/**
 * Validation error classes
 */

import { AppError } from '../base/AppError';
import { ERROR_CODES } from '../base/constants';

export class ValidationError extends AppError {
  constructor(field: string, message: string, value?: unknown) {
    super(
      `Validation error for field "${field}": ${message}`,
      ERROR_CODES.VALIDATION_ERROR,
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

/**
 * Assert functions for fail-fast validation
 */
export const assertDefined = <T>(
  value: T | undefined | null,
  message: string
): asserts value is T => {
  if (value === undefined || value === null) {
    throw new ValidationError('value', message, value);
  }
};

export const assertNotEmpty = (
  value: string | unknown[],
  field: string
): void => {
  if (typeof value === 'string' && value.trim() === '') {
    throw new ValidationError(field, 'Cannot be empty');
  }
  if (Array.isArray(value) && value.length === 0) {
    throw new ValidationError(field, 'Cannot be empty array');
  }
};

export const assertInRange = (
  value: number,
  min: number,
  max: number,
  field: string
): void => {
  if (value < min || value > max) {
    throw new ValidationError(
      field,
      `Must be between ${min} and ${max}`,
      value
    );
  }
};