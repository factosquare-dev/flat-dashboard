import type { Brand } from './branded';
import type { ProductCategoryId } from './productCategory';

// Product ID branded type
export type ProductId = Brand<string, 'ProductId'>;

// Product status enum
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  PENDING = 'pending'
}

// Product interface
export interface Product {
  id: ProductId;
  name: string;
  description?: string;
  categoryId: ProductCategoryId;
  sku?: string; // Stock Keeping Unit
  barcode?: string;
  price?: number;
  cost?: number;
  weight?: number; // grams
  volume?: number; // ml
  status: ProductStatus;
  tags?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  // 제조 관련 정보
  manufacturingInfo?: {
    leadTime?: number; // days
    minOrderQuantity?: number;
    shelfLife?: number; // days
    storageConditions?: string;
  };
}

// Product creation input
export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

// Product update input
export type ProductUpdate = Partial<ProductInput>;

// Product filter options
export interface ProductFilter {
  categoryId?: ProductCategoryId;
  status?: ProductStatus;
  search?: string;
  tags?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// Product with category info
export interface ProductWithCategory extends Product {
  categoryName?: string;
  categoryPath?: string;
}