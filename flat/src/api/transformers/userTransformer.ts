import type { User, UserRole } from '../../types/user';
import type { ApiResponse } from '../../types/api';
import { toUserId, toUserIdSafe } from '@/types/branded';

// API Response interfaces
interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  phone?: string;
  department?: string;
  position?: string;
  avatar_url?: string;
}

/**
 * Transform API user response to domain model with branded types
 */
export function transformApiUser(apiUser: ApiUser): User {
  return {
    id: toUserId(apiUser.id),
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role as UserRole,
    isActive: apiUser.is_active,
    lastLogin: apiUser.last_login ? new Date(apiUser.last_login) : undefined,
    createdAt: new Date(apiUser.created_at),
    updatedAt: new Date(apiUser.updated_at),
    phone: apiUser.phone,
    department: apiUser.department,
    position: apiUser.position,
    avatarUrl: apiUser.avatar_url
  };
}

/**
 * Transform domain model to API request format
 */
export function transformUserToApi(user: Partial<User>): Partial<ApiUser> {
  const apiUser: Partial<ApiUser> = {};
  
  if (user.id) apiUser.id = user.id;
  if (user.email) apiUser.email = user.email;
  if (user.name) apiUser.name = user.name;
  if (user.role) apiUser.role = user.role;
  if (user.isActive !== undefined) apiUser.is_active = user.isActive;
  if (user.lastLogin) apiUser.last_login = user.lastLogin.toISOString();
  if (user.phone) apiUser.phone = user.phone;
  if (user.department) apiUser.department = user.department;
  if (user.position) apiUser.position = user.position;
  if (user.avatarUrl) apiUser.avatar_url = user.avatarUrl;
  
  return apiUser;
}

/**
 * Transform paginated API response
 */
export function transformApiUserList(response: ApiResponse<ApiUser[]>): ApiResponse<User[]> {
  if (!response.success || !response.data) {
    return response as ApiResponse<User[]>;
  }
  
  return {
    ...response,
    data: response.data.map(transformApiUser)
  };
}

/**
 * Validate and transform user ID from API
 */
export function validateApiUserId(id: unknown): string {
  if (typeof id !== 'string') {
    throw new Error(`Invalid user ID type: ${typeof id}`);
  }
  
  const userId = toUserIdSafe(id);
  if (!userId) {
    throw new Error(`Invalid user ID format: ${id}`);
  }
  
  return userId;
}