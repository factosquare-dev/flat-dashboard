/**
 * User API endpoints
 */

import { getServices } from '../../services';
import { QueryOptions } from '../../database/types';
import { User } from '@/types/user';
import { simulateDelay, shouldSimulateError, formatResponse } from '../common';

export const userApi = {
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

  async getFactories(userId: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch user factories');
    }
    
    const services = getServices();
    const result = await services.users.getUserFactories(userId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user factories');
    }
    
    return formatResponse(true, result.data);
  },

  async getProjects(userId: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch user projects');
    }
    
    const services = getServices();
    const result = await services.projects.getUserProjects(userId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user projects');
    }
    
    return formatResponse(true, result.data);
  },
};