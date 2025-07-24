export const FACTORY_TYPES = {
  MANUFACTURING: '제조',
  CONTAINER: '용기',
  PACKAGING: '포장',
} as const;

export const FACTORY_TYPE_OPTIONS = Object.values(FACTORY_TYPES);

export const CERTIFICATE_TYPES = {
  // Quality Management
  ISO_22716: 'ISO 22716',
  CGMP: 'CGMP',
  ISO_9001: 'ISO 9001',
  ISO_14001: 'ISO 14001',
  ISO_45001: 'ISO 45001',
  
  // Environmental & Ethical
  FSC: 'FSC',
  VEGAN: 'VEGAN',
  HALAL: 'HALAL',
  EWG: 'EWG',
  COSMOS: 'COSMOS',
  ECOCERT: 'ECOCERT',
} as const;

export const CERTIFICATE_TYPE_OPTIONS = Object.values(CERTIFICATE_TYPES);

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