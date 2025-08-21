/**
 * User type definitions
 */

import { UserId } from './branded';

// Main user role levels
export enum UserRole {
  ADMIN = 'ADMIN',                     // Level 1: Full system access
  INTERNAL_MANAGER = 'INTERNAL_MANAGER', // Level 2: Internal managers (our company)
  EXTERNAL_MANAGER = 'EXTERNAL_MANAGER', // Level 3: External managers (factory contact points)
  CUSTOMER = 'CUSTOMER',               // Level 4: External customers
}

// Internal Manager sub-roles (departments)
export enum InternalManagerType {
  SALES = 'SALES',
  CONTENT = 'CONTENT',
  CONTAINER = 'CONTAINER',
  QA = 'QA',
  RA = 'RA',
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  locale?: 'ko' | 'en';
  notifications?: boolean;
  emailNotifications?: boolean;
}

export interface User {
  id: UserId;
  username: string;
  email: string;
  name: string;
  role: UserRole;                              // Main role
  internalManagerType?: InternalManagerType;   // If role is INTERNAL_MANAGER
  factoryId?: string;                          // Associated factory for external managers
  position?: string;
  department?: string;
  company?: string;                            // Company name (for external users)
  profileImage?: string;
  permissions: string[];
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;               // User preferences
}