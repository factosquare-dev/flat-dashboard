/**
 * Factory API endpoints
 */

import { getServices } from '@/mocks/services';
import { QueryOptions } from '@/core/database/types';
import { Factory } from '@/shared/types/factory';
import { simulateDelay, shouldSimulateError, formatResponse } from '@/mocks/common';

export const factoryApi = {
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

  async getProjects(factoryId: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch factory projects');
    }
    
    const services = getServices();
    const result = await services.factories.getFactoryProjects(factoryId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch factory projects');
    }
    
    return formatResponse(true, result.data);
  },

  async getUsers(factoryId: string) {
    await simulateDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch factory users');
    }
    
    const services = getServices();
    const result = await services.factories.getFactoryUsers(factoryId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch factory users');
    }
    
    return formatResponse(true, result.data);
  },
};