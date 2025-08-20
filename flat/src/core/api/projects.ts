import { apiClient } from './client/interceptors';
import type { Project } from '@/shared/types/project';
import { ProjectId, CustomerId, extractIdString } from '@/shared/types/branded';
import { convertApiProject, convertApiProjects } from '@/shared/utils/apiConversions';

export interface ProjectsApiResponse {
  data: Project[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  customerId: CustomerId;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  budget?: number;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: ProjectId;
}

export const projectsApi = {
  // Get all projects with optional filters
  getProjects: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    customerId?: CustomerId;
  }): Promise<ProjectsApiResponse> => {
    const response = await apiClient.get('/projects', { 
      params: params ? {
        ...params,
        customerId: params.customerId ? extractIdString(params.customerId) : undefined
      } : undefined
    });
    return {
      ...response.data,
      data: convertApiProjects(response.data.data)
    };
  },

  // Get single project by ID
  getProject: async (id: ProjectId): Promise<Project> => {
    const response = await apiClient.get(`/projects/${extractIdString(id)}`);
    return convertApiProject(response.data);
  },

  // Create new project
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const payload = {
      ...data,
      customerId: extractIdString(data.customerId)
    };
    const response = await apiClient.post('/projects', payload);
    return convertApiProject(response.data);
  },

  // Update existing project
  updateProject: async (data: UpdateProjectRequest): Promise<Project> => {
    const { id, customerId, ...updateData } = data;
    const payload = {
      ...updateData,
      customerId: customerId ? extractIdString(customerId) : undefined
    };
    const response = await apiClient.put(`/projects/${extractIdString(id)}`, payload);
    return convertApiProject(response.data);
  },

  // Delete project
  deleteProject: async (id: ProjectId): Promise<void> => {
    await apiClient.delete(`/projects/${extractIdString(id)}`);
  },

  // Get project statistics
  getProjectStats: async (): Promise<{
    total: number;
    active: number;
    completed: number;
    delayed: number;
  }> => {
    const response = await apiClient.get('/projects/stats');
    return response.data;
  },

  // Get projects by customer
  getProjectsByCustomer: async (customerId: CustomerId): Promise<Project[]> => {
    const response = await apiClient.get(`/projects/customer/${extractIdString(customerId)}`);
    return convertApiProjects(response.data);
  },
};