import { 
  FactoryType, 
  FactoryTypeLabel,
  CertificateType, 
  CertificateTypeLabel 
} from '../types/enums';

// Legacy support - use FactoryTypeLabel from enums instead
export const FACTORY_TYPES = FactoryTypeLabel;

export const FACTORY_TYPE_OPTIONS = Object.values(FactoryTypeLabel);

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

// Task types by factory type
export const TASK_TYPES = {
  MANUFACTURING: {
    MATERIAL_RECEIPT: '원료 수령',
    MATERIAL_INSPECTION: '원료 검사',
    MIXING: '배합',
    BLENDING: '혼합',
    AGING: '숙성',
    FIRST_QUALITY_CHECK: '1차 품질 검사',
    FILLING: '충전',
    SECOND_QUALITY_CHECK: '2차 품질 검사',
    STABILITY_TEST: '안정성 테스트',
    FINAL_INSPECTION: '완제품 검사',
    SHIPPING_PREP: '출하 준비',
  },
  CONTAINER: {
    DESIGN: '용기 디자인',
    MOLD_MAKING: '금형 제작',
    PROTOTYPE_MAKING: '시제품 제작',
    INJECTION_MOLDING: '사출 성형',
    CONTAINER_INSPECTION: '용기 검사',
    PRINTING_LABELING: '인쇄/라벨링',
    SURFACE_TREATMENT: '표면 처리',
    ASSEMBLY: '조립',
    PACKAGING_PREP: '포장 준비',
    QUALITY_CHECK: '품질 검사',
    SHIPPING: '출하',
  },
  PACKAGING: {
    DESIGN: '포장 디자인',
    PRINT_PREP: '인쇄 준비',
    MATERIAL_MAKING: '포장재 제작',
    PACKAGING_WORK: '포장 작업',
    LABEL_ATTACHMENT: '라벨 부착',
    BOX_PACKAGING: '박스 포장',
    SHRINK_WRAP: '수축 포장',
    PACKAGING_INSPECTION: '포장 검사',
    PALLET_LOADING: '파레트 적재',
    SHIPPING_PREP: '출하 준비',
    DELIVERY: '배송',
  },
} as const;