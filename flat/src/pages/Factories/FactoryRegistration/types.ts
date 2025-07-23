import type { CertificationType, FactoryManager } from '../../../data/factories';

export interface FactoryFormData {
  name: string;
  type: '제조' | '용기' | '포장';
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