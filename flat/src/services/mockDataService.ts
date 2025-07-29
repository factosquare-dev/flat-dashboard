/**
 * Mock Data Service
 * 중앙집중식 데이터 관리를 위한 서비스
 * 모든 하드코딩된 데이터를 Mock DB를 통해 관리
 */

import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import { FACTORY_TYPES, TASK_TYPES } from '../constants/factory';
import type { Factory } from '../types/factory';
import type { Task } from '../types/schedule';
import type { Project } from '../types/project';
import type { ProductCategory, ProductCategoryId } from '../types/productCategory';
import type { Product, ProductId } from '../types/product';
import { FactoryId, ProjectId, TaskId, toFactoryId, toProjectId, generateProductCategoryId, generateProductId } from '../types/branded';

class MockDataService {
  private db: MockDatabaseImpl;

  constructor() {
    this.db = MockDatabaseImpl.getInstance();
  }

  /**
   * Factory 관련 메서드
   */
  
  // 모든 공장 가져오기
  getAllFactories(): Factory[] {
    const database = this.db.getDatabase();
    return Array.from(database.factories.values());
  }

  // 타입별 공장 가져오기
  getFactoriesByType(type: string): Factory[] {
    const factories = this.getAllFactories();
    return factories.filter(f => f.type === type);
  }

  // ID로 공장 가져오기
  getFactoryById(id: string | FactoryId): Factory | undefined {
    const database = this.db.getDatabase();
    return database.factories.get(id);
  }

  // 공장 ID로 태스크 타입 가져오기
  getTaskTypesForFactory(factoryId: string | FactoryId): string[] {
    const factory = this.getFactoryById(factoryId);
    if (!factory) return [];

    // 공장 타입에 따른 태스크 타입 반환
    switch (factory.type) {
      case FACTORY_TYPES.MANUFACTURING:
        return Object.values(TASK_TYPES.MANUFACTURING);
      case FACTORY_TYPES.CONTAINER:
        return Object.values(TASK_TYPES.CONTAINER);
      case FACTORY_TYPES.PACKAGING:
        return Object.values(TASK_TYPES.PACKAGING);
      default:
        return [];
    }
  }

  /**
   * Task 관련 메서드
   */
  
  // 모든 태스크 가져오기
  getAllTasks(): Task[] {
    const database = this.db.getDatabase();
    return Array.from(database.tasks.values());
  }
  
  // 프로젝트의 모든 태스크 가져오기
  getTasksByProjectId(projectId: string | ProjectId): Task[] {
    const database = this.db.getDatabase();
    const tasks = Array.from(database.tasks.values());
    return tasks.filter(task => {
      // schedule을 통해 projectId 매칭
      const schedule = Array.from(database.schedules.values()).find(
        s => s.id === task.scheduleId
      );
      return schedule?.projectId === projectId;
    });
  }

  // 공장별 태스크 가져오기
  getTasksByFactoryId(factoryId: string | FactoryId): Task[] {
    const database = this.db.getDatabase();
    const tasks = Array.from(database.tasks.values());
    return tasks.filter(task => task.factoryId === factoryId);
  }

  /**
   * Project 관련 메서드
   */
  
  // 모든 프로젝트 가져오기
  getAllProjects(): Project[] {
    const database = this.db.getDatabase();
    return Array.from(database.projects.values());
  }

  // 프로젝트에 할당된 공장 가져오기
  getFactoriesForProject(projectId: string | ProjectId): Factory[] {
    const project = this.db.getDatabase().projects.get(projectId);
    if (!project) return [];

    const factories: Factory[] = [];
    
    if (project.manufacturerId) {
      const factory = this.getFactoryById(project.manufacturerId);
      if (factory) factories.push(factory);
    }
    
    if (project.containerId) {
      const factory = this.getFactoryById(project.containerId);
      if (factory) factories.push(factory);
    }
    
    if (project.packagingId) {
      const factory = this.getFactoryById(project.packagingId);
      if (factory) factories.push(factory);
    }

    return factories;
  }

  /**
   * 담당자 관련 메서드
   */
  
  // 공장 ID로 담당자 가져오기
  getAssigneeForFactoryId(factoryId: string): string {
    const factory = this.getFactoryById(factoryId);
    if (factory?.manager) {
      return factory.manager.name;
    }
    
    // Fallback: 랜덤 매니저
    const database = this.db.getDatabase();
    const users = Array.from(database.users.values());
    const managers = users.filter(u => u.role === 'PRODUCT_MANAGER');
    
    if (managers.length > 0) {
      const randomIndex = Math.floor(Math.random() * managers.length);
      return managers[randomIndex].name;
    }
    
    return '담당자 미정';
  }

  /**
   * ProductCategory 관련 메서드
   */
  
  // 모든 제품 카테고리 가져오기
  getProductCategories(): ProductCategory[] {
    const database = this.db.getDatabase();
    return Array.from(database.productCategories?.values() || []);
  }

  // 계층 구조로 정렬된 제품 카테고리 가져오기
  getProductCategoriesHierarchy(): ProductCategory[] {
    const categories = this.getProductCategories();
    const rootCategories = categories.filter(cat => !cat.parentId);
    
    const buildHierarchy = (parent: ProductCategory): ProductCategory => {
      const children = categories
        .filter(cat => cat.parentId === parent.id)
        .sort((a, b) => a.order - b.order)
        .map(buildHierarchy);
      
      return { ...parent, children };
    };

    return rootCategories
      .sort((a, b) => a.order - b.order)
      .map(buildHierarchy);
  }

  // 제품 카테고리 추가
  addProductCategory(category: Omit<ProductCategory, 'id'>): ProductCategory {
    const database = this.db.getDatabase();
    if (!database.productCategories) {
      database.productCategories = new Map();
    }

    const newCategory: ProductCategory = {
      ...category,
      id: generateProductCategoryId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    database.productCategories.set(newCategory.id, newCategory);
    this.db.save();
    return newCategory;
  }

  // 제품 카테고리 업데이트
  updateProductCategory(id: ProductCategoryId, updates: Partial<ProductCategory>): ProductCategory | null {
    const database = this.db.getDatabase();
    const category = database.productCategories?.get(id);
    
    if (!category) return null;

    const updatedCategory: ProductCategory = {
      ...category,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    database.productCategories!.set(id, updatedCategory);
    this.db.save();
    return updatedCategory;
  }

  // 제품 카테고리 삭제
  deleteProductCategory(id: ProductCategoryId): boolean {
    const database = this.db.getDatabase();
    if (!database.productCategories) return false;

    const result = database.productCategories.delete(id);
    this.db.save();
    return result;
  }

  // 플랫 리스트로 제품 카테고리 가져오기 (드롭다운용)
  getProductCategoriesFlat(): Array<{ id: string; name: string; fullPath: string }> {
    const categories = this.getProductCategories();
    const result: Array<{ id: string; name: string; fullPath: string }> = [];

    const getDepth = (categoryId: ProductCategoryId, visited = new Set<string>()): number => {
      if (visited.has(categoryId)) return 0; // 순환 참조 방지
      visited.add(categoryId);

      const category = categories.find(cat => cat.id === categoryId);
      if (!category || !category.parentId) return 0;
      
      return 1 + getDepth(category.parentId, visited);
    };

    const buildDisplayName = (category: ProductCategory): string => {
      const depth = getDepth(category.id);
      const indent = '  '.repeat(depth); // 2칸 공백으로 들여쓰기
      return depth > 0 ? `${indent}${category.name}` : category.name;
    };

    // 정렬을 위해 모든 카테고리에 대해 full path 구축
    const buildSortPath = (categoryId: ProductCategoryId, visited = new Set<string>()): string => {
      if (visited.has(categoryId)) return ''; // 순환 참조 방지
      visited.add(categoryId);

      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return '';

      if (category.parentId) {
        const parentPath = buildSortPath(category.parentId, visited);
        return parentPath ? `${parentPath}/${category.name}` : category.name;
      }

      return category.name;
    };

    categories.forEach(category => {
      result.push({
        id: category.id,
        name: category.name,
        fullPath: buildDisplayName(category)
      });
    });

    // 계층 구조 순서로 정렬
    return result.sort((a, b) => {
      const aPath = buildSortPath(a.id as ProductCategoryId);
      const bPath = buildSortPath(b.id as ProductCategoryId);
      return aPath.localeCompare(bPath);
    });
  }

  /**
   * Product 관련 메서드
   */
  
  // 모든 제품 가져오기
  getProducts(): Product[] {
    const database = this.db.getDatabase();
    return Array.from(database.products?.values() || []);
  }

  // 카테고리별 제품 가져오기
  getProductsByCategory(categoryId: ProductCategoryId): Product[] {
    const products = this.getProducts();
    return products.filter(product => product.categoryId === categoryId);
  }

  // ID로 제품 가져오기
  getProductById(id: ProductId): Product | undefined {
    const database = this.db.getDatabase();
    return database.products?.get(id);
  }

  // 제품 추가
  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const database = this.db.getDatabase();
    if (!database.products) {
      database.products = new Map();
    }

    const newProduct: Product = {
      ...product,
      id: generateProductId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    database.products.set(newProduct.id, newProduct);
    this.db.save();
    return newProduct;
  }

  // 제품 업데이트
  updateProduct(id: ProductId, updates: Partial<Product>): Product | null {
    const database = this.db.getDatabase();
    const product = database.products?.get(id);
    
    if (!product) return null;

    const updatedProduct: Product = {
      ...product,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    database.products!.set(id, updatedProduct);
    this.db.save();
    return updatedProduct;
  }

  // 제품 삭제
  deleteProduct(id: ProductId): boolean {
    const database = this.db.getDatabase();
    if (!database.products) return false;

    const result = database.products.delete(id);
    this.db.save();
    return result;
  }

  // 제품 검색
  searchProducts(query: string): Product[] {
    const products = this.getProducts();
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // 카테고리 정보와 함께 제품 가져오기
  getProductsWithCategory(): Array<Product & { categoryName: string; categoryPath: string }> {
    const products = this.getProducts();
    const categories = this.getProductCategoriesFlat();
    
    return products.map(product => {
      const category = categories.find(cat => cat.id === product.categoryId);
      return {
        ...product,
        categoryName: category?.name || '미분류',
        categoryPath: category?.fullPath || '미분류'
      };
    });
  }

  /**
   * 유틸리티 메서드
   */
  
  // Mock DB 초기화
  resetDatabase(): void {
    // localStorage 클리어
    localStorage.removeItem('mockDb');
    // DB 재초기화
    location.reload();
  }

  // 데이터 저장 (영구 저장)
  saveDatabase(): void {
    this.db.save();
  }

  // 강제 데이터 새로고침 (새 스키마 적용용)
  forceRefresh(): void {
    localStorage.removeItem('mockDb');
    // DB 인스턴스 재생성
    this.db = MockDatabaseImpl.getInstance();
  }

}

// 싱글톤 인스턴스
export const mockDataService = new MockDataService();