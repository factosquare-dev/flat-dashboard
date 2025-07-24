/**
 * Mock API Implementation
 * Simulates real API endpoints with realistic delays and error scenarios
 */

import { getServices } from '../services';
import { QueryOptions } from '../database/types';
import { User } from '@/types/user';
import { Factory } from '@/types/factory';
import { Project } from '@/types/project';

// API delay simulation
const API_DELAY = {
  MIN: 100,
  MAX: 500,
  ERROR: 1000,
};

// Error rate simulation (0-1)
const ERROR_RATE = 0.05; // 5% error rate

/**
 * Simulate API delay
 */
function simulateDelay(isError = false): Promise<void> {
  const delay = isError 
    ? API_DELAY.ERROR 
    : Math.random() * (API_DELAY.MAX - API_DELAY.MIN) + API_DELAY.MIN;
  
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simulate random errors
 */
function shouldSimulateError(): boolean {
  return Math.random() < ERROR_RATE;
}

/**
 * Format API response
 */
function formatResponse<T>(success: boolean, data?: T, error?: string) {
  if (success) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    success: false,
    error: error || 'Unknown error occurred',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Mock API Endpoints
 */
export const mockApi = {
  // User endpoints
  users: {
    async getAll(params?: QueryOptions) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to fetch users');
      }
      
      const services = getServices();
      const result = params 
        ? await services.users.query(params)
        : await services.users.getAll();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }
      
      return formatResponse(true, result.data);
    },

    async getById(id: string) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to fetch user');
      }
      
      const services = getServices();
      const result = await services.users.getByIdWithRelations(id);
      
      if (!result.success) {
        throw new Error(result.error || 'User not found');
      }
      
      return formatResponse(true, result.data);
    },

    async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to create user');
      }
      
      const services = getServices();
      const result = await services.users.create(data);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create user');
      }
      
      return formatResponse(true, result.data);
    },

    async update(id: string, data: Partial<User>) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to update user');
      }
      
      const services = getServices();
      const result = await services.users.update(id, data);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user');
      }
      
      return formatResponse(true, result.data);
    },

    async delete(id: string) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to delete user');
      }
      
      const services = getServices();
      const result = await services.users.delete(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }
      
      return formatResponse(true, null);
    },

    async login(username: string, password: string) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Login service unavailable');
      }
      
      const services = getServices();
      const result = await services.users.authenticate(username, password);
      
      if (!result.success) {
        throw new Error(result.error || 'Invalid credentials');
      }
      
      // Generate mock token
      const token = btoa(JSON.stringify({
        userId: result.data!.id,
        username: result.data!.username,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }));
      
      return formatResponse(true, {
        user: result.data,
        token,
      });
    },
  },

  // Factory endpoints
  factories: {
    async getAll(params?: QueryOptions) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to fetch factories');
      }
      
      const services = getServices();
      const result = params 
        ? await services.factories.query(params)
        : await services.factories.getAll();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch factories');
      }
      
      return formatResponse(true, result.data);
    },

    async getById(id: string) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to fetch factory');
      }
      
      const services = getServices();
      const result = await services.factories.getByIdWithRelations(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Factory not found');
      }
      
      return formatResponse(true, result.data);
    },

    async create(data: Omit<Factory, 'id' | 'createdAt' | 'updatedAt'>) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to create factory');
      }
      
      const services = getServices();
      const result = await services.factories.create(data);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create factory');
      }
      
      return formatResponse(true, result.data);
    },

    async update(id: string, data: Partial<Factory>) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to update factory');
      }
      
      const services = getServices();
      const result = await services.factories.update(id, data);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update factory');
      }
      
      return formatResponse(true, result.data);
    },

    async delete(id: string) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to delete factory');
      }
      
      const services = getServices();
      const result = await services.factories.delete(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete factory');
      }
      
      return formatResponse(true, null);
    },

    async getByType(type: '제조' | '용기' | '포장') {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to fetch factories by type');
      }
      
      const services = getServices();
      const result = await services.factories.getByType(type);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch factories');
      }
      
      return formatResponse(true, result.data);
    },

    async checkAvailability(factoryId: string, startDate: string, endDate: string) {
      await simulateDelay();
      
      if (shouldSimulateError()) {
        throw new Error('Failed to check availability');
      }
      
      const services = getServices();
      const result = await services.factories.checkFactoryAvailability(
        factoryId,
        new Date(startDate),
        new Date(endDate)
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to check availability');
      }
      
      return formatResponse(true, { available: result.data });
    },
  },

  // Project endpoints
  projects: {
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
  },

  // Database management endpoints
  database: {
    async getStats() {
      await simulateDelay();
      
      const { getDatabaseStats } = await import('../services');
      const stats = getDatabaseStats();
      
      return formatResponse(true, stats);
    },

    async export() {
      await simulateDelay();
      
      const { exportDatabase } = await import('../services');
      const data = exportDatabase();
      
      return formatResponse(true, { data });
    },

    async import(data: string) {
      await simulateDelay();
      
      const { importDatabase } = await import('../services');
      const success = importDatabase(data);
      
      if (!success) {
        throw new Error('Failed to import database');
      }
      
      return formatResponse(true, null);
    },

    async reset() {
      await simulateDelay();
      
      const { resetServices } = await import('../services');
      resetServices();
      
      return formatResponse(true, null);
    },
  },
};

/**
 * Initialize mock API
 */
export function initializeMockApi() {
  // Initialize services on first use
  const { initializeServices } = require('../services');
  initializeServices();
  
}