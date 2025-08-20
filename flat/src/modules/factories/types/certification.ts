/**
 * Certification related types
 */

import type { CertificationType } from '@/core/database/factories';

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