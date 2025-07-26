import { apiClient } from './api';
import type { Factory, FactoryType } from '../types/factory';
import type { ApiResponse } from '../types/api';
import type { FactoryId } from '../types/branded';
import { 
  transformApiFactory, 
  transformApiFactoryList, 
  transformFactoryToApi 
} from '../api/transformers';

interface FactoryFilter {
  type?: FactoryType;
  status?: string;
  search?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

class FactoryService {
  private readonly basePath = '/api/factories';

  async getFactories(
    filters?: FactoryFilter,
    pagination?: PaginationParams
  ): Promise<ApiResponse<{ factories: Factory[]; total: number }>> {
    const response = await apiClient.get<any>(this.basePath, {
      params: {
        ...filters,
        ...pagination
      }
    });

    // Transform API response to domain model
    if (response.success && response.data) {
      const transformedData = transformApiFactoryList({
        ...response,
        data: response.data.factories
      });
      
      return {
        ...response,
        data: {
          factories: transformedData.data as Factory[],
          total: response.data.total
        }
      };
    }
    
    return response;
  }

  async getFactory(id: FactoryId): Promise<ApiResponse<Factory>> {
    const response = await apiClient.get<any>(`${this.basePath}/${id}`);
    
    // Transform API response to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiFactory(response.data)
      };
    }
    
    return response;
  }

  async createFactory(data: Partial<Factory>): Promise<ApiResponse<Factory>> {
    // Transform domain model to API format
    const apiData = transformFactoryToApi(data);
    const response = await apiClient.post<any>(this.basePath, apiData);
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiFactory(response.data)
      };
    }
    
    return response;
  }

  async updateFactory(id: FactoryId, data: Partial<Factory>): Promise<ApiResponse<Factory>> {
    // Transform domain model to API format
    const apiData = transformFactoryToApi(data);
    const response = await apiClient.patch<any>(`${this.basePath}/${id}`, apiData);
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiFactory(response.data)
      };
    }
    
    return response;
  }

  async deleteFactory(id: FactoryId): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async updateFactoryStatus(id: FactoryId, status: string): Promise<ApiResponse<Factory>> {
    const response = await apiClient.patch<any>(`${this.basePath}/${id}/status`, { status });
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiFactory(response.data)
      };
    }
    
    return response;
  }

  async getFactoryCapabilities(id: FactoryId): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${this.basePath}/${id}/capabilities`);
  }

  async updateFactoryCapabilities(
    id: FactoryId, 
    capabilities: string[]
  ): Promise<ApiResponse<Factory>> {
    const response = await apiClient.put<any>(
      `${this.basePath}/${id}/capabilities`, 
      { capabilities }
    );
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiFactory(response.data)
      };
    }
    
    return response;
  }
}

export const factoryService = new FactoryService();