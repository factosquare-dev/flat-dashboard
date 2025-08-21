/**
 * Product Type Utility Functions
 * 제품 유형 관련 공통 유틸리티 함수들
 */

import { ProductType } from '@/shared/types/enums';

/**
 * ProductType을 한글로 변환하는 함수
 * @param type ProductType enum 또는 문자열
 * @returns 한글 제품유형명
 */
export const getProductTypeLabel = (type: ProductType | string): string => {
  const labels: Record<string, string> = {
    [ProductType.SKINCARE]: '스킨케어',
    [ProductType.MAKEUP]: '메이크업',
    [ProductType.HAIRCARE]: '헤어케어',
    [ProductType.BODYCARE]: '바디케어',
    [ProductType.PERFUME]: '향수',
    [ProductType.SUPPLEMENT]: '건강기능식품',
    [ProductType.DEVICE]: '미용기기',
    [ProductType.OTHER]: '기타',
  };
  
  return labels[type as string] || type || '제품유형';
};

/**
 * 중복된 제품유형에 번호를 매기는 함수
 * @param projects 프로젝트 배열
 * @param currentProject 현재 프로젝트
 * @param index 현재 인덱스
 * @returns 번호가 매겨진 제품유형명 (예: "스킨케어 (1)")
 */
export const getProductLabel = (projects: any[], currentProject: any, index: number): string => {
  if (!projects || !Array.isArray(projects) || !currentProject) {
    return '제품유형';
  }
  
  const baseLabel = getProductTypeLabel(currentProject.productType || currentProject.product?.productType);
  const sameTypeProjects = projects.filter(
    p => getProductTypeLabel(p.productType || p.product?.productType) === baseLabel
  );
  
  if (sameTypeProjects.length > 1) {
    const typeIndex = sameTypeProjects.findIndex(p => p.id === currentProject.id);
    return `${baseLabel} (${typeIndex + 1})`;
  }
  
  return baseLabel;
};