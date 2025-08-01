/**
 * Cached API service - Provides cached wrappers for common API operations
 */

import { useMemo } from 'react';
import { apiClient } from './api';
import type { ApiResponse } from './api/requestHandlers';

// Common API response types
interface Project {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Factory {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  assigneeId: string;
  dueDate: string;
}

/**
 * Cached API service class
 */
class CachedApiService {
  /**
   * Projects API
   */
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>('/api/projects');
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`/api/projects/${id}`);
  }

  async createProject(data: Partial<Project>): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>('/api/projects', data);
  }

  async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(`/api/projects/${id}`, data);
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/projects/${id}`);
  }

  /**
   * Users API
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>('/api/users');
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/api/users/${id}`);
  }

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/api/users', data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/api/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/users/${id}`);
  }

  /**
   * Factories API
   */
  async getFactories(): Promise<ApiResponse<Factory[]>> {
    return apiClient.get<Factory[]>('/api/factories');
  }

  async getFactory(id: string): Promise<ApiResponse<Factory>> {
    return apiClient.get<Factory>(`/api/factories/${id}`);
  }

  async createFactory(data: Partial<Factory>): Promise<ApiResponse<Factory>> {
    return apiClient.post<Factory>('/api/factories', data);
  }

  async updateFactory(id: string, data: Partial<Factory>): Promise<ApiResponse<Factory>> {
    return apiClient.put<Factory>(`/api/factories/${id}`, data);
  }

  async deleteFactory(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/factories/${id}`);
  }

  /**
   * Tasks API
   */
  async getTasks(projectId?: string): Promise<ApiResponse<Task[]>> {
    const endpoint = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks';
    return apiClient.get<Task[]>(endpoint);
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`/api/tasks/${id}`);
  }

  async createTask(data: Partial<Task>): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>('/api/tasks', data);
  }

  async updateTask(id: string, data: Partial<Task>): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(`/api/tasks/${id}`, data);
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/tasks/${id}`);
  }

  /**
   * Bulk operations
   */
  async bulkUpdateTasks(updates: Array<{ id: string; data: Partial<Task> }>): Promise<ApiResponse<Task[]>> {
    return apiClient.post<Task[]>('/api/tasks/bulk-update', { updates });
  }

  async bulkDeleteTasks(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/tasks/bulk-delete', { ids });
  }

  /**
   * Search operations (cached for performance)
   */
  async searchProjects(query: string): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>(`/api/projects/search?q=${encodeURIComponent(query)}`);
  }

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>(`/api/users/search?q=${encodeURIComponent(query)}`);
  }

  async searchFactories(query: string): Promise<ApiResponse<Factory[]>> {
    return apiClient.get<Factory[]>(`/api/factories/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Analytics endpoints (highly cacheable)
   */
  async getProjectStats(projectId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/projects/${projectId}/stats`);
  }

  async getUserStats(userId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/users/${userId}/stats`);
  }

  async getFactoryStats(factoryId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/factories/${factoryId}/stats`);
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/dashboard/stats');
  }

  /**
   * Cache management
   */
  invalidateProjectsCache(): void {
    apiClient.invalidateCache(/GET:\/api\/projects/);
  }

  invalidateUsersCache(): void {
    apiClient.invalidateCache(/GET:\/api\/users/);
  }

  invalidateFactoriesCache(): void {
    apiClient.invalidateCache(/GET:\/api\/factories/);
  }

  invalidateTasksCache(): void {
    apiClient.invalidateCache(/GET:\/api\/tasks/);
  }

  clearAllCache(): void {
    apiClient.clearCache();
  }

  getCacheStats() {
    return apiClient.getCacheStats();
  }
}

// Export singleton instance
export const cachedApiService = new CachedApiService();

/**
 * React hook for using cached API service
 */
export function useCachedApiService() {
  return useMemo(() => cachedApiService, []);
}

// Export types
export type { Project, User, Factory, Task };
export default cachedApiService;