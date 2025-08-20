/**
 * Project API endpoints
 */

import { getServices } from '@/mocks/services';
import { QueryOptions } from '@/mocks/database/types';
import { Project } from '@/types/project';
import { simulateDelay, shouldSimulateError, formatResponse } from '@/mocks/common';

export const projectApi = {
  async getAll(params?: QueryOptions) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch projects');
    }
    
    const services = getServices();
    const result = params 
      ? await services.projects.query(params)
      : await services.projects.getAll();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch projects');
    }
    
    return formatResponse(true, result.data);
  },

  async getById(id: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch project');
    }
    
    const services = getServices();
    const result = await services.projects.getByIdWithRelations(id);
    
    if (!result.success) {
      throw new Error(result.error || 'Project not found');
    }
    
    return formatResponse(true, result.data);
  },

  async create(data: any) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to create project');
    }
    
    const services = getServices();
    const result = await services.projects.createWithRelations(data);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create project');
    }
    
    return formatResponse(true, result.data);
  },

  async update(id: string, data: Partial<Project>) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to update project');
    }
    
    const services = getServices();
    const result = await services.projects.update(id, data);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update project');
    }
    
    return formatResponse(true, result.data);
  },

  async delete(id: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to delete project');
    }
    
    const services = getServices();
    const result = await services.projects.delete(id);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete project');
    }
    
    return formatResponse(true, null);
  },

  async updateStatus(id: string, status: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to update project status');
    }
    
    const services = getServices();
    const result = await services.projects.updateStatus(id, status as any);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update status');
    }
    
    return formatResponse(true, result.data);
  },

  async updateProgress(id: string, progress: number) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to update project progress');
    }
    
    const services = getServices();
    const result = await services.projects.updateProgress(id, progress);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update progress');
    }
    
    return formatResponse(true, result.data);
  },

  async addComment(projectId: string, userId: string, content: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to add comment');
    }
    
    const services = getServices();
    const result = await services.projects.addComment(projectId, userId, content);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to add comment');
    }
    
    return formatResponse(true, result.data);
  },

  async assignUser(projectId: string, userId: string, role: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to assign user');
    }
    
    const services = getServices();
    const result = await services.projects.assignUserToProject(
      projectId,
      userId,
      role as any,
      'system' // In real app, this would be current user
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to assign user');
    }
    
    return formatResponse(true, result.data);
  },

  async removeUser(projectId: string, userId: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to remove user');
    }
    
    const services = getServices();
    const result = await services.projects.removeUserFromProject(projectId, userId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to remove user');
    }
    
    return formatResponse(true, null);
  },

  async syncSubProjects(masterId: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to sync sub projects');
    }
    
    const services = getServices();
    const result = await services.projects.syncSubProjectsWithMaster(masterId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to sync sub projects');
    }
    
    return formatResponse(true, result.data);
  },

  async validateProject(projectId: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to validate project');
    }
    
    const services = getServices();
    const result = await services.projects.validateMasterSubConsistency(projectId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to validate project');
    }
    
    return formatResponse(true, result.data);
  },
};