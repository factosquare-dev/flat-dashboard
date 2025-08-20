// 내용물 타입 enum
export enum ContentType {
  N_LEVEL = 'N차',
  FRAGRANCE = '향',
  MATERIAL = '원료'
}

// 내용물 타입 라벨
export const ContentTypeLabel = {
  [ContentType.N_LEVEL]: 'N차 주가버튼',
  [ContentType.FRAGRANCE]: '향 주가버튼',
  [ContentType.MATERIAL]: '원료 주가버튼'
} as const;

// 내용물 서브카테고리 기본값
export const ContentSubCategoryDefault = {
  [ContentType.N_LEVEL]: '내용물',
  [ContentType.FRAGRANCE]: '향',
  [ContentType.MATERIAL]: '원료'
} as const;