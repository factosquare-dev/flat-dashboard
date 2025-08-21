import type { CertificationType, FactoryManager } from '@/core/database/factories';
import { FactoryType } from '@/shared/types/enums';

export interface FactoryFormData {
  name: string;
  type: FactoryType;
  address: string;
  contact: string;
  email: string;
  capacity: string;
  certifications: CertificationType[];
  managers: FactoryManager[];
}

export interface FactoryRegistrationProps {
  // Add props if needed in the future
}