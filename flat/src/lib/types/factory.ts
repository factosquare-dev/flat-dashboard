/**
 * Factory type definitions
 */

import { FactoryType, CertificateType } from './enums';
import { FactoryId } from './branded';

export interface FactoryManager {
  name: string;
  phone: string;
  email: string;
}

export interface Factory {
  id: FactoryId;
  name: string;
  type: FactoryType;
  address: string;
  contactNumber: string;
  manager: FactoryManager;
  capacity: number;
  certifications?: CertificateType[];
  establishedDate?: Date;
  isActive: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}