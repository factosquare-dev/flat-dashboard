/**
 * Certification related types
 */

import type { CertificationType } from '@/data/factories';

export interface CertificationDetail {
  id: string;
  type: CertificationType;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
}

export interface CertificationFormData {
  type: CertificationType | '';
  certNumber: string;
  issueDate: string;
  expiryDate: string;
}