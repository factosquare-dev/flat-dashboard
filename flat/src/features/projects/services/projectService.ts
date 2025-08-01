import { apiClient } from '@/features/common/services';
import type { Project, ProjectFilter, ProjectFormData, ProjectMetrics } from '../types';
import type { ApiResponse, PaginationParams, SortParams } from '../../common/types';
import type { Project as ProjectModel, ProjectType } from '../../../types/project';
import type { 
  ProjectsResponse, 
  ProjectResponse, 
  CreateProjectResponse, 
  UpdateProjectResponse,
  DeleteProjectResponse 
} from '../../../types/api';
import { API_ENDPOINTS } from '@/types/api';
import { 
  transformApiProject, 
  transformApiProjectList, 
  transformProjectToApi 
} from '@/api/transformers';

class ProjectService {
  private readonly basePath = API_ENDPOINTS.PROJECTS;

  async getProjects(
    filters?: ProjectFilter,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<ApiResponse<{ projects: Project[]; total: number }>> {
    const response = await apiClient.get<any>(this.basePath, {
      params: {
        ...filters,
        ...pagination,
        sortBy: sort?.field,
        sortOrder: sort?.order,
      },
    });

    // Transform API response to domain model
    if (response.success && response.data) {
      const transformedData = transformApiProjectList({
        ...response,
        data: response.data.projects
      });
      
      return {
        ...response,
        data: {
          projects: transformedData.data as Project[],
          total: response.data.total
        }
      };
    }
    
    return response;
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await apiClient.get<any>(API_ENDPOINTS.PROJECT_BY_ID(id));
    
    // Transform API response to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiProject(response.data) as Project
      };
    }
    
    return response;
  }

  async createProject(data: ProjectFormData): Promise<ApiResponse<Project>> {
    // Transform domain model to API format
    const apiData = transformProjectToApi(data as Partial<ProjectModel>);
    const response = await apiClient.post<any>(this.basePath, apiData);
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiProject(response.data) as Project
      };
    }
    
    return response;
  }

  async updateProject(id: string, data: Partial<ProjectModel>): Promise<ApiResponse<Project>> {
    // Validate project type and parentId relationship
    const validatedData = { ...data };
    
    // If updating to MASTER type, ensure parentId is removed
    if (validatedData.type === ProjectType.MASTER && validatedData.parentId) {
      delete validatedData.parentId;
    }
    
    // If project has parentId but type is MASTER, throw error
    if (validatedData.type === ProjectType.MASTER && validatedData.parentId !== undefined && validatedData.parentId !== null) {
      throw new Error('MASTER projects cannot have a parent project');
    }
    
    // Only SUB projects can have parentId
    if (validatedData.parentId && validatedData.type && validatedData.type !== ProjectType.SUB) {
      throw new Error('Only SUB projects can have a parent project');
    }
    
    // Transform domain model to API format
    const apiData = transformProjectToApi(validatedData);
    const response = await apiClient.patch<any>(API_ENDPOINTS.PROJECT_BY_ID(id), apiData);
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiProject(response.data) as Project
      };
    }
    
    return response;
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.PROJECT_BY_ID(id));
  }

  async getProjectMetrics(): Promise<ApiResponse<ProjectMetrics>> {
    return apiClient.get<ProjectMetrics>(`${this.basePath}/metrics`);
  }

  async updateProjectStatus(
    id: string,
    status: Project['status']
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.patch<any>(`${API_ENDPOINTS.PROJECT_BY_ID(id)}/status`, { status });
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiProject(response.data) as Project
      };
    }
    
    return response;
  }

  async assignUsers(id: string, userIds: string[]): Promise<ApiResponse<Project>> {
    const response = await apiClient.post<any>(`${API_ENDPOINTS.PROJECT_BY_ID(id)}/assign`, { userIds });
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiProject(response.data) as Project
      };
    }
    
    return response;
  }

  async uploadAttachment(id: string, file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post<{ url: string }, FormData>(`${API_ENDPOINTS.PROJECT_BY_ID(id)}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async exportProjects(format: 'csv' | 'excel' | 'pdf'): Promise<ApiResponse<Blob>> {
    return apiClient.get<Blob>(`${this.basePath}/export`, {
      params: { format },
      headers: {
        Accept: format === 'csv' ? 'text/csv' : 
                format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                'application/pdf',
      },
    });
  }
}

export const projectService = new ProjectService();