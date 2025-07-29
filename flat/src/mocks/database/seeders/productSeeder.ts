import { ProductStatus, type Product, type ProductId } from '../../../types/product';
import type { ProductCategoryId } from '../../../types/productCategory';
import { getCurrentISOString } from '../../../utils/unifiedDateUtils';

export function createProducts(): Product[] {
  const now = getCurrentISOString();
  
  const products: Product[] = [
    // 스킨케어 - 토너/미스트
    {
      id: '2001' as ProductId,
      name: '하이드라 토너',
      description: '수분 공급 토너',
      categoryId: '1002' as ProductCategoryId,
      sku: 'SKC-TON-001',
      price: 25000,
      cost: 15000,
      volume: 150,
      status: ProductStatus.ACTIVE,
      tags: ['수분', '민감성피부'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 14,
        minOrderQuantity: 500,
        shelfLife: 730,
        storageConditions: '실온 보관'
      }
    },
    {
      id: '2002' as ProductId,
      name: '로즈 미스트',
      description: '장미 추출물 미스트',
      categoryId: '1002' as ProductCategoryId,
      sku: 'SKC-MST-001',
      price: 28000,
      cost: 18000,
      volume: 100,
      status: ProductStatus.ACTIVE,
      tags: ['로즈', '진정'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 10,
        minOrderQuantity: 300,
        shelfLife: 365,
        storageConditions: '냉장 보관'
      }
    },

    // 스킨케어 - 에센스/세럼
    {
      id: '2003' as ProductId,
      name: '비타민 C 세럼',
      description: '고농축 비타민 C 세럼',
      categoryId: '1003' as ProductCategoryId,
      sku: 'SKC-SER-001',
      price: 45000,
      cost: 28000,
      volume: 30,
      status: ProductStatus.ACTIVE,
      tags: ['비타민C', '브라이트닝'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 21,
        minOrderQuantity: 200,
        shelfLife: 545,
        storageConditions: '냉장 보관'
      }
    },
    {
      id: '2004' as ProductId,
      name: '히알루론 에센스',
      description: '고분자 히알루론산 에센스',
      categoryId: '1003' as ProductCategoryId,
      sku: 'SKC-ESS-001',
      price: 38000,
      cost: 22000,
      volume: 50,
      status: ProductStatus.ACTIVE,
      tags: ['히알루론산', '수분'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 18,
        minOrderQuantity: 400,
        shelfLife: 730,
        storageConditions: '실온 보관'
      }
    },

    // 스킨케어 - 크림/로션
    {
      id: '2005' as ProductId,
      name: '모이스처 크림',
      description: '24시간 보습 크림',
      categoryId: '1004' as ProductCategoryId,
      sku: 'SKC-CRM-001',
      price: 35000,
      cost: 20000,
      volume: 50,
      status: ProductStatus.ACTIVE,
      tags: ['보습', '24시간'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 12,
        minOrderQuantity: 600,
        shelfLife: 1095,
        storageConditions: '실온 보관'
      }
    },

    // 메이크업 - 베이스메이크업
    {
      id: '2006' as ProductId,
      name: '글로우 파운데이션',
      description: '자연스러운 광채 파운데이션',
      categoryId: '1007' as ProductCategoryId,
      sku: 'MKP-FND-001',
      price: 42000,
      cost: 25000,
      volume: 30,
      status: ProductStatus.ACTIVE,
      tags: ['글로우', '커버리지'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 25,
        minOrderQuantity: 300,
        shelfLife: 1095,
        storageConditions: '실온 보관'
      }
    },

    // 메이크업 - 색조메이크업
    {
      id: '2007' as ProductId,
      name: '벨벳 립스틱',
      description: '매트 벨벳 립스틱',
      categoryId: '1008' as ProductCategoryId,
      sku: 'MKP-LIP-001',
      price: 22000,
      cost: 12000,
      weight: 3.5,
      status: ProductStatus.ACTIVE,
      tags: ['매트', '벨벳'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 20,
        minOrderQuantity: 1000,
        shelfLife: 1095,
        storageConditions: '실온 보관'
      }
    },

    // 바디케어 - 바디로션
    {
      id: '2008' as ProductId,
      name: '시어버터 바디로션',
      description: '진정 시어버터 바디로션',
      categoryId: '1010' as ProductCategoryId,
      sku: 'BDC-LOT-001',
      price: 18000,
      cost: 10000,
      volume: 200,
      status: ProductStatus.ACTIVE,
      tags: ['시어버터', '진정'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 15,
        minOrderQuantity: 800,
        shelfLife: 1095,
        storageConditions: '실온 보관'
      }
    },

    // 헤어케어 - 샴푸
    {
      id: '2009' as ProductId,
      name: '아르간 샴푸',
      description: '아르간 오일 영양 샴푸',
      categoryId: '1013' as ProductCategoryId,
      sku: 'HRC-SMP-001',
      price: 24000,
      cost: 14000,
      volume: 300,
      status: ProductStatus.ACTIVE,
      tags: ['아르간오일', '영양'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 12,
        minOrderQuantity: 600,
        shelfLife: 1095,
        storageConditions: '실온 보관'
      }
    },

    // 개발 중인 제품
    {
      id: '2010' as ProductId,
      name: '레티놀 세럼',
      description: '고농축 레티놀 안티에이징 세럼',
      categoryId: '1003' as ProductCategoryId,
      sku: 'SKC-SER-002',
      price: 55000,
      cost: 35000,
      volume: 30,
      status: ProductStatus.PENDING,
      tags: ['레티놀', '안티에이징'],
      createdAt: now,
      updatedAt: now,
      manufacturingInfo: {
        leadTime: 28,
        minOrderQuantity: 150,
        shelfLife: 365,
        storageConditions: '냉장 보관'
      }
    }
  ];

  return products;
}