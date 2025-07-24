import { apiClient } from '../../common/services';
import type { Project, ProjectFilter, ProjectFormData, ProjectMetrics } from '../types';
import type { ApiResponse, PaginationParams, SortParams } from '../../common/types';
import type { Project as ProjectModel, ProjectType } from '../../../types/project';

class ProjectService {
  private readonly basePath = '/projects';

  async getProjects(
    filters?: ProjectFilter,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<ApiResponse<{ projects: Project[]; total: number }>> {
    return apiClient.get(this.basePath, {
      params: {
        ...filters,
        ...pagination,
        sortBy: sort?.field,
        sortOrder: sort?.order,
      },
    });
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  async createProject(data: ProjectFormData): Promise<ApiResponse<Project>> {
    return apiClient.post(this.basePath, data);
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
    
    return apiClient.patch(`${this.basePath}/${id}`, validatedData);
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  async getProjectMetrics(): Promise<ApiResponse<ProjectMetrics>> {
    return apiClient.get(`${this.basePath}/metrics`);
  }

  async updateProjectStatus(
    id: string,
    status: Project['status']
  ): Promise<ApiResponse<Project>> {
    return apiClient.patch(`${this.basePath}/${id}/status`, { status });
  }

  async assignUsers(id: string, userIds: string[]): Promise<ApiResponse<Project>> {
    return apiClient.post(`${this.basePath}/${id}/assign`, { userIds });
  }

  async uploadAttachment(id: string, file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(`${this.basePath}/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async exportProjects(format: 'csv' | 'excel' | 'pdf'): Promise<ApiResponse<Blob>> {
    return apiClient.get(`${this.basePath}/export`, {
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