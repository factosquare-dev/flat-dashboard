/**
 * Data integrity error classes
 */

import { AppError, ErrorDetails } from '../base/AppError';
import { ERROR_CODES } from '../base/constants';

export class DataIntegrityError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(
      message,
      ERROR_CODES.DATA_INTEGRITY_ERROR,
      500,
      details
    );
  }
}

export class DuplicateError extends AppError {
  constructor(entity: string, field: string, value: string) {
    super(
      `${entity} with ${field} "${value}" already exists`,
      ERROR_CODES.DUPLICATE_ERROR,
      409,
      { entity, field, value }
    );
  }
}