import { apiClient } from './api';
import type { User, UserRole } from '@/shared/types/user';
import type { ApiResponse } from '@/shared/types/api';
import type { UserId } from '@/shared/types/branded';
import { 
  transformApiUser, 
  transformApiUserList, 
  transformUserToApi 
} from '@/api/transformers';

interface UserFilter {
  role?: UserRole;
  isActive?: boolean;
  department?: string;
  search?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

class UserService {
  private readonly basePath = '/api/users';

  async getUsers(
    filters?: UserFilter,
    pagination?: PaginationParams
  ): Promise<ApiResponse<{ users: User[]; total: number }>> {
    const response = await apiClient.get<any>(this.basePath, {
      params: {
        ...filters,
        ...pagination
      }
    });

    // Transform API response to domain model
    if (response.success && response.data) {
      const transformedData = transformApiUserList({
        ...response,
        data: response.data.users
      });
      
      return {
        ...response,
        data: {
          users: transformedData.data as User[],
          total: response.data.total
        }
      };
    }
    
    return response;
  }

  async getUser(id: UserId): Promise<ApiResponse<User>> {
    const response = await apiClient.get<any>(`${this.basePath}/${id}`);
    
    // Transform API response to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiUser(response.data)
      };
    }
    
    return response;
  }

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    // Transform domain model to API format
    const apiData = transformUserToApi(data);
    const response = await apiClient.post<any>(this.basePath, apiData);
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiUser(response.data)
      };
    }
    
    return response;
  }

  async updateUser(id: UserId, data: Partial<User>): Promise<ApiResponse<User>> {
    // Transform domain model to API format
    const apiData = transformUserToApi(data);
    const response = await apiClient.patch<any>(`${this.basePath}/${id}`, apiData);
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiUser(response.data)
      };
    }
    
    return response;
  }

  async deleteUser(id: UserId): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async updateUserRole(id: UserId, role: UserRole): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<any>(`${this.basePath}/${id}/role`, { role });
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiUser(response.data)
      };
    }
    
    return response;
  }

  async updateUserStatus(id: UserId, isActive: boolean): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<any>(`${this.basePath}/${id}/status`, { 
      is_active: isActive 
    });
    
    // Transform API response back to domain model
    if (response.success && response.data) {
      return {
        ...response,
        data: transformApiUser(response.data)
      };
    }
    
    return response;
  }

  async uploadAvatar(id: UserId, file: File): Promise<ApiResponse<{ url: string }>> {
    return apiClient.upload<{ url: string }>(
      `${this.basePath}/${id}/avatar`,
      file
    );
  }
}

export const userService = new UserService();