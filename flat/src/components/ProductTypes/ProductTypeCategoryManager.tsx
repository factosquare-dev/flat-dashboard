import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import CategoryTree from './CategoryTree';
import CategoryEditModal from './CategoryEditModal';
import FloatingActionButton from '../common/FloatingActionButton';
import type { ProductCategory, ProductCategoryId } from '@/types/productCategory';
import { generateProductCategoryId } from '@/types/branded';
import { useProductCategories } from '@/hooks/useProducts';
import { ButtonVariant } from '@/types/enums';
import { mockDataService } from '@/services/mockDataService';

const ProductTypeCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    // MockDB에서 계층 구조 데이터 로드
    try {
      const loadedCategories = mockDataService.getProductCategoriesHierarchy();
      // ID 카운터 업데이트
      const allCategories = mockDataService.getProductCategories();
      const allIds = allCategories.map(cat => parseInt(cat.id)).filter(id => !isNaN(id));
      if (allIds.length > 0) {
        const maxId = Math.max(...allIds);
        if (maxId >= 1000) {
          (window as any).__productCategoryIdCounter = maxId;
        }
      }
      return loadedCategories;
    } catch (error) {
      console.error('Failed to load product categories:', error);
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [parentCategory, setParentCategory] = useState<ProductCategory | null>(null);

  const handleAddCategory = (parent?: ProductCategory) => {
    setParentCategory(parent || null);
    setEditingCategory(null);
    setShowEditModal(true);
  };

  const handleEditCategory = (category: ProductCategory, parent?: ProductCategory) => {
    setEditingCategory(category);
    setParentCategory(parent || null);
    setShowEditModal(true);
  };

  const handleSaveCategory = (data: { name: string; description?: string; parentId?: string }) => {
    if (editingCategory) {
      // 수정
      try {
        const updated = mockDataService.updateProductCategory(editingCategory.id, {
          name: data.name,
          description: data.description,
          parentId: data.parentId || null,
        });
        
        if (updated) {
          // UI 상태 업데이트
          setCategories(mockDataService.getProductCategoriesHierarchy());
        }
      } catch (error) {
        console.error('Failed to update category:', error);
      }
    } else {
      // 새로 추가
      try {
        const targetParentId = data.parentId || null;
        const targetParent = targetParentId ? findCategoryById(categories, targetParentId) : null;
        
        const newCategory = mockDataService.addProductCategory({
          name: data.name,
          description: data.description,
          parentId: targetParentId,
          order: targetParent ? targetParent.children?.length || 0 : categories.length,
          children: []
        });

        // UI 상태 업데이트
        setCategories(mockDataService.getProductCategoriesHierarchy());
      } catch (error) {
        console.error('Failed to add category:', error);
      }
    }
    setShowEditModal(false);
  };

  const handleDeleteCategory = (categoryId: ProductCategoryId) => {
    try {
      const deleted = mockDataService.deleteProductCategory(categoryId);
      if (deleted) {
        // UI 상태 업데이트
        setCategories(mockDataService.getProductCategoriesHierarchy());
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleMoveCategory = (
    draggedId: ProductCategoryId,
    targetId: ProductCategoryId | null,
    position: 'before' | 'after' | 'inside'
  ) => {
    // Find and remove the dragged category
    let draggedCategory: ProductCategory | null = null;
    
    const findAndRemoveCategory = (items: ProductCategory[]): ProductCategory[] => {
      const result: ProductCategory[] = [];
      for (const item of items) {
        if (item.id === draggedId) {
          draggedCategory = item;
        } else {
          const newItem = { ...item };
          if (newItem.children) {
            newItem.children = findAndRemoveCategory(newItem.children);
          }
          result.push(newItem);
        }
      }
      return result;
    };

    // Insert the dragged category at the new position
    const insertCategory = (items: ProductCategory[], targetId: ProductCategoryId | null, position: 'before' | 'after' | 'inside'): ProductCategory[] => {
      if (!draggedCategory) return items;

      if (targetId === null) {
        // Moving to root level
        if (position === 'inside') {
          return [...items, { ...draggedCategory, parentId: null }];
        }
        return items;
      }

      const result: ProductCategory[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.id === targetId) {
          if (position === 'before') {
            result.push({ ...draggedCategory, parentId: item.parentId });
            result.push(item);
          } else if (position === 'after') {
            result.push(item);
            result.push({ ...draggedCategory, parentId: item.parentId });
          } else if (position === 'inside') {
            const newChildren = [...(item.children || []), { ...draggedCategory, parentId: item.id }];
            result.push({ ...item, children: newChildren });
          }
        } else {
          const newItem = { ...item };
          if (newItem.children) {
            newItem.children = insertCategory(newItem.children, targetId, position);
          }
          result.push(newItem);
        }
      }
      return result;
    };

    // Don't allow moving a category into itself or its descendants
    const isDescendant = (parentId: ProductCategoryId, childId: ProductCategoryId): boolean => {
      const findInTree = (items: ProductCategory[]): boolean => {
        for (const item of items) {
          if (item.id === parentId) {
            const checkChildren = (children: ProductCategory[]): boolean => {
              for (const child of children) {
                if (child.id === childId) return true;
                if (child.children && checkChildren(child.children)) return true;
              }
              return false;
            };
            return item.children ? checkChildren(item.children) : false;
          }
          if (item.children && findInTree(item.children)) return true;
        }
        return false;
      };
      return findInTree(categories);
    };

    if (targetId && (draggedId === targetId || isDescendant(draggedId, targetId))) {
      return; // Prevent invalid moves
    }

    const withoutDragged = findAndRemoveCategory(categories);
    const withInserted = insertCategory(withoutDragged, targetId, position);
    
    setCategories(withInserted);
  };

  // 카테고리 찾기 헬퍼 함수
  const findCategoryById = (items: ProductCategory[], id: string): ProductCategory | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findCategoryById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 현재 최대 ID를 찾아서 카운터 업데이트
  const updateIdCounter = (categories: ProductCategory[]) => {
    const allIds = categories.map(cat => parseInt(cat.id)).filter(id => !isNaN(id));
    if (allIds.length > 0) {
      const maxId = Math.max(...allIds);
      // 전역 카운터 업데이트 (간단한 방법)
      if (maxId >= 1000) {
        (window as any).__productCategoryIdCounter = maxId;
      }
    }
  };

  const filteredCategories = searchQuery
    ? categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  return (
    <>
      {/* 툴바 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="카테고리 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리 개수 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          총 {filteredCategories.length}개의 카테고리
        </p>
      </div>

      {/* 카테고리 트리 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <CategoryTree
          categories={filteredCategories}
          onAdd={handleAddCategory}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onMove={handleMoveCategory}
        />
      </div>

      {/* 플로팅 액션 버튼 */}
      <FloatingActionButton
        onClick={() => handleAddCategory()}
        icon={<Plus />}
        label="카테고리 추가"
        variant={ButtonVariant.PRIMARY}
        position="first"
      />

      {/* 편집 모달 */}
      {showEditModal && (
        <CategoryEditModal
          category={editingCategory}
          parent={parentCategory}
          availableParents={categories}
          onSave={handleSaveCategory}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default ProductTypeCategoryManager;