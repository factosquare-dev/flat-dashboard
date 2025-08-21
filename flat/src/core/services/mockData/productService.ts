/**
 * Product-related mock data service methods
 */

import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import type { ProductCategory, ProductCategoryId } from '@/shared/types/productCategory';
import type { Product, ProductId } from '@/shared/types/product';
import { generateProductCategoryId, generateProductId } from '@/shared/types/branded';

export class ProductDataService {
  private db: MockDatabaseImpl;

  constructor(db: MockDatabaseImpl) {
    this.db = db;
  }

  /**
   * ProductCategory 관련 메서드
   */

  // 모든 제품 카테고리 가져오기
  getProductCategories(): ProductCategory[] {
    const database = this.db.getDatabase();
    return Array.from(database.productCategories.values());
  }

  // 계층 구조로 제품 카테고리 가져오기
  getProductCategoriesHierarchy(): ProductCategory[] {
    const categories = this.getProductCategories();
    
    // 루트 카테고리 찾기
    const rootCategories = categories.filter(cat => !cat.parentId);
    
    // 재귀적으로 자식 카테고리 추가
    const addChildren = (parent: ProductCategory): ProductCategory => {
      const children = categories.filter(cat => cat.parentId === parent.id);
      return {
        ...parent,
        children: children.map(child => addChildren(child))
      };
    };
    
    return rootCategories.map(root => addChildren(root));
  }

  // ID로 제품 카테고리 가져오기
  getProductCategoryById(id: string | ProductCategoryId): ProductCategory | undefined {
    const database = this.db.getDatabase();
    return database.productCategories.get(id);
  }

  // 제품 카테고리 생성
  createProductCategory(category: Omit<ProductCategory, 'id'>): ProductCategory {
    const newCategory: ProductCategory = {
      ...category,
      id: generateProductCategoryId()
    };
    
    const database = this.db.getDatabase();
    database.productCategories.set(newCategory.id, newCategory);
    this.db.saveToStorage();
    
    return newCategory;
  }

  // 제품 카테고리 업데이트
  updateProductCategory(id: string | ProductCategoryId, updates: Partial<ProductCategory>): boolean {
    return this.db.update('productCategories', id, updates);
  }

  // 제품 카테고리 삭제
  deleteProductCategory(id: string | ProductCategoryId): boolean {
    // 자식 카테고리가 있는지 확인
    const categories = this.getProductCategories();
    const hasChildren = categories.some(cat => cat.parentId === id);
    
    if (hasChildren) {
      console.error('Cannot delete category with children');
      return false;
    }
    
    return this.db.delete('productCategories', id);
  }

  /**
   * Product 관련 메서드
   */

  // 모든 제품 가져오기
  getProducts(): Product[] {
    const database = this.db.getDatabase();
    return Array.from(database.products.values());
  }

  // 카테고리별 제품 가져오기
  getProductsByCategory(categoryId: string | ProductCategoryId): Product[] {
    const products = this.getProducts();
    return products.filter(product => product.categoryId === categoryId);
  }

  // ID로 제품 가져오기
  getProductById(id: string | ProductId): Product | undefined {
    const database = this.db.getDatabase();
    return database.products.get(id);
  }

  // 제품 생성
  createProduct(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...product,
      id: generateProductId()
    };
    
    const database = this.db.getDatabase();
    database.products.set(newProduct.id, newProduct);
    this.db.saveToStorage();
    
    return newProduct;
  }

  // 제품 업데이트
  updateProduct(id: string | ProductId, updates: Partial<Product>): boolean {
    return this.db.update('products', id, updates);
  }

  // 제품 삭제
  deleteProduct(id: string | ProductId): boolean {
    return this.db.delete('products', id);
  }
}