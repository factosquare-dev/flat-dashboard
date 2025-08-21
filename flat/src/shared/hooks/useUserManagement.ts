import { useState, useCallback, useEffect } from 'react';
import type { UserData } from './useUserFilter';
import type { UserFormData } from '@/modules/users/UserModal';
import type { UserRole } from '@/store/slices/userSlice';
import { UserService } from '@/core/services/UserService';
import type { User } from '@/shared/types/user';
import { UserRole as UserRoleEnum } from '@/shared/types/user';

// Create user service instance
const userService = new UserService();

// Map database UserRole to UI UserRole
const mapUserRole = (dbRole: string): UserRole => {
  // Return the role as-is since we're using the same enum values
  return dbRole as UserRole;
};

// Convert database User to UserData
const convertUserToUserData = (user: User): UserData => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phoneNumber || '',
    role: mapUserRole(user.role),
    department: user.department,
    position: user.position
  };
};


export const useUserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from mock database
  const loadUsers = useCallback(async () => {
    try {
      const result = await userService.getAll();
      if (result.success && result.data) {
        const userData = result.data.map(convertUserToUserData);
        setUsers(userData);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const addUser = useCallback(async (userData: UserFormData): Promise<UserData | null> => {
    try {
      const result = await userService.create({
        username: userData.email.split('@')[0],
        email: userData.email,
        name: userData.name,
        role: userData.role as any,
        position: userData.position,
        department: userData.department,
        phoneNumber: userData.phone,
        permissions: [],
        isActive: true,
      });

      if (result.success && result.data) {
        const newUserData = convertUserToUserData(result.data);
        setUsers(prev => [...prev, newUserData]);
        return newUserData;
      }
    } catch (error) {
    }
    return null;
  }, []);

  const updateUser = useCallback(async (userId: string, userData: UserFormData): Promise<boolean> => {
    try {
      const result = await userService.update(userId, {
        email: userData.email,
        name: userData.name,
        role: userData.role as any,
        position: userData.position,
        department: userData.department,
        phoneNumber: userData.phone,
      });

      if (result.success && result.data) {
        const updatedUserData = convertUserToUserData(result.data);
        setUsers(prev => prev.map(u => 
          u.id === userId ? updatedUserData : u
        ));
        return true;
      }
    } catch (error) {
    }
    return false;
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const result = await userService.delete(userId);
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        return true;
      }
    } catch (error) {
    }
    return false;
  }, []);

  const getUserById = useCallback((userId: string): UserData | undefined => {
    return users.find(u => u.id === userId);
  }, [users]);

  const getUsersByRole = useCallback((role: UserData['role']): UserData[] => {
    return users.filter(u => u.role === role);
  }, [users]);

  const checkEmailExists = useCallback((email: string, excludeUserId?: string): boolean => {
    return users.some(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.id !== excludeUserId
    );
  }, [users]);

  const checkPhoneExists = useCallback((phone: string, excludeUserId?: string): boolean => {
    const normalizedPhone = phone.replace(/[^0-9]/g, '');
    return users.some(u => {
      const userPhone = u.phone.replace(/[^0-9]/g, '');
      return userPhone === normalizedPhone && u.id !== excludeUserId;
    });
  }, [users]);

  return {
    users,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    getUsersByRole,
    checkEmailExists,
    checkPhoneExists,
    refreshUsers: loadUsers,
  };
};