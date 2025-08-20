/**
 * User Data Service
 * Wrapper for User service operations with synchronous interface
 */

import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { User, UserRole } from '@/shared/types/user';

export class UserDataService {
  private db: MockDatabaseImpl;

  constructor(db: MockDatabaseImpl) {
    this.db = db;
  }

  /**
   * Get all users synchronously (for hooks)
   */
  getAllUsers(): User[] {
    try {
      // Use internal database data directly for synchronous access
      const db = (this.db as any).db;
      const usersMap = db?.users;
      
      if (!usersMap) {
        return [];
      }
      
      // Convert Map to Array
      if (usersMap instanceof Map) {
        return Array.from(usersMap.values());
      }
      
      // Fallback if it's already an array
      return Array.isArray(usersMap) ? usersMap : [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  /**
   * Search users by name
   */
  searchUsers(searchTerm: string): User[] {
    try {
      const users = this.getAllUsers();
      const searchLower = searchTerm.toLowerCase();
      
      return users.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | null {
    try {
      const users = this.getAllUsers();
      return users.find(user => user.id === id) || null;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: UserRole): User[] {
    try {
      const users = this.getAllUsers();
      return users.filter(user => user.role === role);
    } catch (error) {
      console.error('Failed to fetch users by role:', error);
      return [];
    }
  }

  /**
   * Get managers (Product Manager, Admin, Factory Manager)
   */
  getManagers(): User[] {
    try {
      const users = this.getAllUsers();
      return users.filter(user => 
        user.role === UserRole.PRODUCT_MANAGER || 
        user.role === UserRole.ADMIN ||
        user.role === UserRole.FACTORY_MANAGER
      );
    } catch (error) {
      console.error('Failed to fetch managers:', error);
      return [];
    }
  }

  /**
   * Get active users only
   */
  getActiveUsers(): User[] {
    try {
      const users = this.getAllUsers();
      return users.filter(user => user.isActive);
    } catch (error) {
      console.error('Failed to fetch active users:', error);
      return [];
    }
  }
}