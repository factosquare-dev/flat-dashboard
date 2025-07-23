/**
 * User type definitions
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  PRODUCT_MANAGER = 'PRODUCT_MANAGER',
  FACTORY_MANAGER = 'FACTORY_MANAGER',
  DEVELOPER = 'DEVELOPER',
  QA = 'QA',
  USER = 'USER',
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  position?: string;
  department?: string;
  profileImage?: string;
  permissions: string[];
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}