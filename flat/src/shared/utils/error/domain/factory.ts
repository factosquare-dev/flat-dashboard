/**
 * Factory domain error classes
 */

import { AppError } from '../base/AppError';
import { ERROR_CODES } from '../base/constants';

export class FactoryNotFoundError extends AppError {
  constructor(id: string) {
    super(
      `Factory with id "${id}" not found`,
      ERROR_CODES.FACTORY_NOT_FOUND,
      404,
      { factoryId: id }
    );
  }
}

export class InvalidFactoryDataError extends AppError {
  constructor(message: string, data?: unknown) {
    super(
      message,
      ERROR_CODES.INVALID_FACTORY_DATA,
      400,
      { data }
    );
  }
}