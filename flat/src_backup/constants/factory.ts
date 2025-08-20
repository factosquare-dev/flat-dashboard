import { 
  FactoryType, 
  FactoryTypeLabel,
  CertificateType, 
  CertificateTypeLabel,
  TaskType,
  TaskTypeLabel,
  TasksByFactoryType
} from '@/types/enums';

// Factory type constants - use FactoryType enum values
export const FACTORY_TYPES = FactoryType;

export const FACTORY_TYPE_OPTIONS = Object.values(FactoryType);

// Legacy support - use CertificateTypeLabel from enums instead
export const CERTIFICATE_TYPES = CertificateTypeLabel;

export const CERTIFICATE_TYPE_OPTIONS = Object.values(CertificateTypeLabel);

// Factory form labels
export const FACTORY_FORM_LABELS = {
  BASIC_INFO: '기본 정보',
  FACTORY_NAME: '공장명',
  FACTORY_TYPE: '공장 유형',
  ADDRESS: '주소',
  CONTACT: '연락처',
  EMAIL: '이메일',
  CERTIFICATIONS: '보유 인증',
} as const;

// Re-export task types from enums for backward compatibility
export { TaskType, TaskTypeLabel, TasksByFactoryType } from '@/types/enums';