/**
 * Project domain error classes
 */

import { AppError } from '../base/AppError';
import { ERROR_CODES } from '../base/constants';

export class ProjectNotFoundError extends AppError {
  constructor(id: string) {
    super(
      `Project with id "${id}" not found`,
      ERROR_CODES.PROJECT_NOT_FOUND,
      404,
      { projectId: id }
    );
  }
}

export class InvalidProjectStatusError extends AppError {
  constructor(status: string, validStatuses: string[]) {
    super(
      `Invalid project status "${status}". Valid statuses are: ${validStatuses.join(', ')}`,
      ERROR_CODES.INVALID_PROJECT_STATUS,
      400,
      { status, validStatuses }
    );
  }
}