/**
 * Factory type definitions
 */

export interface FactoryManager {
  name: string;
  phone: string;
  email: string;
}

export interface Factory {
  id: string;
  name: string;
  type: '제조' | '용기' | '포장';
  address: string;
  contactNumber: string;
  manager: FactoryManager;
  capacity: number;
  certifications?: string[];
  establishedDate?: Date;
  isActive: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}