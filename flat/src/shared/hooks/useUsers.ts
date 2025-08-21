import { useMemo } from 'react';
import { mockDataService } from '@/core/services/mockDataService';
import type { User } from '@/shared/types/user';
import { UserRole } from '@/shared/types/user';

/**
 * Hook for managing user data
 */
export const useUsers = () => {
  const users = useMemo(() => {
    try {
      return mockDataService.getUsers();
    } catch (error) {
      return [];
    }
  }, []);

  return {
    users,
    isLoading: false,
    error: null
  };
};

/**
 * Hook for getting mentionable users (managers and admins)
 */
export const useMentionableUsers = () => {
  const { users } = useUsers();
  
  const mentionableUsers = useMemo(() => {
    return users
      .filter(user => user.role === UserRole.INTERNAL_MANAGER || user.role === UserRole.ADMIN)
      .map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.profileImage || ''
      }));
  }, [users]);

  return {
    mentionableUsers,
    isLoading: false,
    error: null
  };
};

/**
 * Hook for getting managers only
 */
export const useManagers = () => {
  const { users } = useUsers();
  
  const managers = useMemo(() => {
    return users.filter(user => 
      user.role === UserRole.INTERNAL_MANAGER || 
      user.role === UserRole.ADMIN ||
      user.role === UserRole.EXTERNAL_MANAGER
    );
  }, [users]);

  return {
    managers,
    isLoading: false,
    error: null
  };
};