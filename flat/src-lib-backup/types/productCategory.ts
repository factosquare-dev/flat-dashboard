import type { Brand } from './branded';

// ProductCategory ID branded type
export type ProductCategoryId = Brand<string, 'ProductCategoryId'>;

export interface ProductCategory {
  id: ProductCategoryId;
  name: string;
  description?: string;
  parentId: ProductCategoryId | null;
  order: number;
  children?: ProductCategory[];
  createdAt?: string;
  updatedAt?: string;
}