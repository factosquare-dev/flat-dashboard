import { ProductType } from '@/types/enums';
import type { Project } from '@/types/project';

// ProductType을 한글로 변환하는 함수
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
  return labels[type] || type || '제품유형';
};

// 중복된 제품유형에 번호 매기기
export const getProductLabel = (
  project: Project, 
  subProjects: Project[]
): string => {
  const baseLabel = getProductTypeLabel(project.productType || project.product?.productType);
  const sameTypeProjects = subProjects.filter(
    p => getProductTypeLabel(p.productType || p.product?.productType) === baseLabel
  );
  
  if (sameTypeProjects.length > 1) {
    const typeIndex = sameTypeProjects.findIndex(p => p.id === project.id);
    return `${baseLabel} (${typeIndex + 1})`;
  }
  
  return baseLabel;
};