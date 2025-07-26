import { apiClient } from './api';
import type { Task, TaskStatus, TaskPriority, TaskType } from '../types/task';
import type { ApiResponse } from '../types/api';
import type { TaskId, ProjectId, UserId } from '../types/branded';
import { 
  transformApiTask, 
  transformApiTaskList, 
  transformTaskToApi 
} from '../api/transformers';

interface TaskFilter {
  projectId?: ProjectId;
  assignedTo?: UserId;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  search?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

class TaskService {
  private readonly basePath = '/api/tasks';

  async getTasks(
    filters?: TaskFilter,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<ApiResponse<{ tasks: Task[]; total: number }>> {
    const params: any = {
      ...pagination,
      sortBy: sort?.field,
      sortOrder: sort?.order
    };

    // Convert filter dates to ISO strings
    if (filters) {
      if (filters.projectId) params.project_id = filters.projectId;
      if (filters.assignedTo) params.assigned_to = filters.assignedTo;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      if (filters.dueDateFrom) params.due_date_from = filters.dueDateFrom.toISOString();
      if (filters.dueDateTo) params.due_date_to = filters.dueDateTo.toISOString();
    }

    const response = await apiClient.get<any>(this.basePath, { params });

    // Transform API response to domain model
    if (response.success && response.data) {
      const transformedData = transformApiTaskList({
        ...response,
        data: response.data.tasks
      });
      
      return {
        ...response,
        data: {
          tasks: transformedData.data as Task[],
          total: response.data.total
        }
      };
    }
    
    return response;
  }

  async getTask(id: TaskId): Promise<ApiResponse<Task>> {
    const response = await apiClient.get<any>(`${this.basePath}/${id}`);
    
    // Transform API response to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiTask(response.data)
      };
    }
    
    return response;
  }

  async createTask(data: Partial<Task>): Promise<ApiResponse<Task>> {
    // Transform domain model to API format
    const apiData = transformTaskToApi(data);
    const response = await apiClient.post<any>(this.basePath, apiData);
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiTask(response.data)
      };
    }
    
    return response;
  }

  async updateTask(id: TaskId, data: Partial<Task>): Promise<ApiResponse<Task>> {
    // Transform domain model to API format
    const apiData = transformTaskToApi(data);
    const response = await apiClient.patch<any>(`${this.basePath}/${id}`, apiData);
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiTask(response.data)
      };
    }
    
    return response;
  }

  async deleteTask(id: TaskId): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async updateTaskStatus(id: TaskId, status: TaskStatus): Promise<ApiResponse<Task>> {
    const response = await apiClient.patch<any>(`${this.basePath}/${id}/status`, { status });
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiTask(response.data)
      };
    }
    
    return response;
  }

  async assignTask(id: TaskId, userId: UserId | null): Promise<ApiResponse<Task>> {
    const response = await apiClient.patch<any>(
      `${this.basePath}/${id}/assign`, 
      { assigned_to: userId }
    );
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiTask(response.data)
      };
    }
    
    return response;
  }

  async updateTaskProgress(id: TaskId, progress: number): Promise<ApiResponse<Task>> {
    const response = await apiClient.patch<any>(
      `${this.basePath}/${id}/progress`, 
      { progress }
    );
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiTask(response.data)
      };
    }
    
    return response;
  }

  async addTaskAttachment(id: TaskId, file: File): Promise<ApiResponse<Task>> {
    const response = await apiClient.upload<any>(
      `${this.basePath}/${id}/attachments`,
      file
    );
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiTask(response.data)
      };
    }
    
    return response;
  }

  async removeTaskAttachment(id: TaskId, attachmentId: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.delete<any>(
      `${this.basePath}/${id}/attachments/${attachmentId}`
    );
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiTask(response.data)
      };
    }
    
    return response;
  }

  async updateTaskChecklist(
    id: TaskId, 
    checklistId: string, 
    isCompleted: boolean
  ): Promise<ApiResponse<Task>> {
    const response = await apiClient.patch<any>(
      `${this.basePath}/${id}/checklist/${checklistId}`, 
      { is_completed: isCompleted }
    );
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiTask(response.data)
      };
    }
    
    return response;
  }
}

export const taskService = new TaskService();