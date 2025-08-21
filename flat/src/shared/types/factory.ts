/**
 * Factory type definitions
 */

import { FactoryType } from './enums/factory';
import { CertificateType } from './enums/product';
import { FactoryId } from './branded';

export interface FactoryManager {
  name: string;
  phone: string;
  email: string;
}

// Re-export FactoryType for convenience
export { FactoryType } from './enums/factory';

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