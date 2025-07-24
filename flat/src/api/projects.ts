import { apiClient } from './client/interceptors';
import type { Project } from '../types';

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
  customerId: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  budget?: number;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

export const projectsApi = {
  // Get all projects with optional filters
  getProjects: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    customerId?: string;
  }): Promise<ProjectsApiResponse> => {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  // Get single project by ID
  getProject: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  // Update existing project
  updateProject: async (data: UpdateProjectRequest): Promise<Project> => {
    const { id, ...updateData } = data;
    const response = await apiClient.put(`/projects/${id}`, updateData);
    return response.data;
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
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
  getProjectsByCustomer: async (customerId: string): Promise<Project[]> => {
    const response = await apiClient.get(`/projects/customer/${customerId}`);
    return response.data;
  },
};