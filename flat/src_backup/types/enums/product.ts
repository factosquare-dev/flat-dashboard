/**
 * Product related enums and constants
 */

// Product Types
export enum ProductType {
  SKINCARE = 'skincare',
  MAKEUP = 'makeup',
  HAIRCARE = 'haircare',
  BODYCARE = 'bodycare',
  PERFUME = 'perfume',
  SUPPLEMENT = 'supplement',
  DEVICE = 'device',
  OTHER = 'other',
}

// Product Type Labels (Korean)
export const ProductTypeLabel: Record<ProductType, string> = {
  [ProductType.SKINCARE]: '스킨케어',
  [ProductType.MAKEUP]: '메이크업',
  [ProductType.HAIRCARE]: '헤어케어',
  [ProductType.BODYCARE]: '바디케어',
  [ProductType.PERFUME]: '향수',
  [ProductType.SUPPLEMENT]: '건강기능식품',
  [ProductType.DEVICE]: '미용기기',
  [ProductType.OTHER]: '기타',
};

// Product Categories by Type
export const ProductCategoriesByType = {
  [ProductType.SKINCARE]: [
    '토너/미스트',
    '에센스/세럼',
    '로션/에멀전',
    '크림',
    '아이케어',
    '마스크팩',
    '선케어',
    '클렌징',
  ],
  [ProductType.MAKEUP]: [
    '베이스메이크업',
    '아이메이크업',
    '립메이크업',
    '치크/하이라이터',
    '네일',
  ],
  [ProductType.HAIRCARE]: [
    '샴푸',
    '린스/컨디셔너',
    '트리트먼트/팩',
    '에센스/오일',
    '스타일링',
  ],
  [ProductType.BODYCARE]: [
    '바디워시',
    '바디로션',
    '바디오일',
    '핸드케어',
    '풋케어',
  ],
  [ProductType.PERFUME]: [
    '오드뜨왈렛',
    '오드퍼퓸',
    '퍼퓸',
    '바디미스트',
    '디퓨저',
  ],
  [ProductType.SUPPLEMENT]: [
    '비타민',
    '미네랄',
    '프로바이오틱스',
    '콜라겐',
    '기타',
  ],
  [ProductType.DEVICE]: [
    '클렌징기기',
    '마사지기기',
    'LED마스크',
    '기타',
  ],
};

// Certificate Types
export enum CertificateType {
  // Quality Management
  ISO_22716 = 'iso_22716',
  CGMP = 'cgmp',
  ISO_9001 = 'iso_9001',
  
  // Environmental
  ISO_14001 = 'iso_14001',
  FSC = 'fsc',
  
  // Safety
  ISO_45001 = 'iso_45001',
  
  // Product Certifications
  VEGAN = 'vegan',
  HALAL = 'halal',
  EWG = 'ewg',
  COSMOS = 'cosmos',
  ECOCERT = 'ecocert',
  DERMATEST = 'dermatest',
  CRUELTY_FREE = 'cruelty_free',
}

// Certificate Type Labels (Korean)
export const CertificateTypeLabel: Record<CertificateType, string> = {
  // Quality
  [CertificateType.ISO_22716]: 'ISO 22716 (화장품 GMP)',
  [CertificateType.CGMP]: 'CGMP (화장품 우수제조기준)',
  [CertificateType.ISO_9001]: 'ISO 9001 (품질경영)',
  
  // Environmental
  [CertificateType.ISO_14001]: 'ISO 14001 (환경경영)',
  [CertificateType.FSC]: 'FSC (산림관리협의회)',
  
  // Safety
  [CertificateType.ISO_45001]: 'ISO 45001 (안전보건경영)',
  
  // Product
  [CertificateType.VEGAN]: '비건 인증',
  [CertificateType.HALAL]: '할랄 인증',
  [CertificateType.EWG]: 'EWG 인증',
  [CertificateType.COSMOS]: 'COSMOS 유기농 인증',
  [CertificateType.ECOCERT]: 'ECOCERT 인증',
  [CertificateType.DERMATEST]: '더마테스트',
  [CertificateType.CRUELTY_FREE]: '동물실험 미실시',
};

// Certificate Categories
export const CertificateCategories = {
  QUALITY: [
    CertificateType.ISO_22716,
    CertificateType.CGMP,
    CertificateType.ISO_9001,
  ],
  ENVIRONMENTAL: [
    CertificateType.ISO_14001,
    CertificateType.FSC,
  ],
  SAFETY: [
    CertificateType.ISO_45001,
  ],
  PRODUCT: [
    CertificateType.VEGAN,
    CertificateType.HALAL,
    CertificateType.EWG,
    CertificateType.COSMOS,
    CertificateType.ECOCERT,
    CertificateType.DERMATEST,
    CertificateType.CRUELTY_FREE,
  ],
};

// Product Status
export enum ProductStatus {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  PRODUCTION = 'production',
  DISCONTINUED = 'discontinued',
}

// Product Status Labels (Korean)
export const ProductStatusLabel: Record<ProductStatus, string> = {
  [ProductStatus.DEVELOPMENT]: '개발중',
  [ProductStatus.TESTING]: '테스트중',
  [ProductStatus.PRODUCTION]: '생산중',
  [ProductStatus.DISCONTINUED]: '단종',
};