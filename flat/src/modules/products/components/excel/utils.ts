import { ContentRow } from './types';
import { getProductTypeLabel } from '@/shared/utils/productTypeUtils';

// Helper function to create new row
export const createNewRow = (id: string, rowNumber: number = 1, productType: string = ''): ContentRow => ({
  id,
  rowNumber,
  productType,
  requestDate: new Date().toISOString().split('T')[0],
  companyName: '',
  labNumber: '',
  factoLabNumber: '',
  productIngredients: '',
  estimatedDate: '',
  productReceiptDate: '',
  customerDelivery: '',
  fileAttachment: '',
  selectedFactories: [],
});

// Helper function to calculate product type with numbering
export const calculateProductType = (
  project: any,
  subProjects: any[],
  typeCountMap: Map<string, number>
): string => {
  const baseProductType = getProductTypeLabel(
    project?.productType || project?.product?.productType || '제품'
  );
  
  const currentCount = typeCountMap.get(baseProductType) || 0;
  typeCountMap.set(baseProductType, currentCount + 1);
  
  const sameTypeCount = subProjects.filter(p => 
    getProductTypeLabel(p.productType || p.product?.productType) === baseProductType
  ).length;
  
  return sameTypeCount === 1
    ? baseProductType
    : `${baseProductType} ${currentCount + 1}`;
};