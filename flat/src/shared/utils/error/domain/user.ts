/**
 * User domain error classes
 */

import { AppError } from '../base/AppError';
import { ERROR_CODES } from '../base/constants';

export class UserNotFoundError extends AppError {
  constructor(id: string) {
    super(
      `User with id "${id}" not found`,
      ERROR_CODES.USER_NOT_FOUND,
      404,
      { userId: id }
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(
      message,
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }
}