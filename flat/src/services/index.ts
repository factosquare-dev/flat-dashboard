// Export all services from a central location
export { apiClient } from './api';
export { userService } from './userService';
export { factoryService } from './factoryService';
export { taskService } from './taskService';
export { projectService } from '../features/projects/services/projectService';

// Re-export types
export type { 
  ApiConfig, 
  ApiResponse, 
  RequestOptions,
  UploadOptions,
  UploadResponse,
  ApiError 
} from './api';