import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ProductCategory } from '@/shared/types/productCategory';

interface CategoryEditModalProps {
  category: ProductCategory | null;
  parent: ProductCategory | null;
  availableParents: ProductCategory[];
  onSave: (data: { name: string; description?: string; parentId?: string }) => void;
  onClose: () => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  category,
  parent,
  availableParents,
  onSave,
  onClose
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setSelectedParentId(category.parentId || '');
    } else {
      setName('');
      setDescription('');
      setSelectedParentId(parent?.id || '');
    }
  }, [category, parent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: selectedParentId || undefined
      });
    }
  };

  // 계층 구조 표시를 위한 재귀 함수
  const renderCategoryOptions = (categories: ProductCategory[], depth: number = 0): JSX.Element[] => {
    return categories.reduce((acc: JSX.Element[], cat) => {
      // 자기 자신과 자신의 하위 카테고리는 부모로 선택할 수 없음
      if (category && (cat.id === category.id || isDescendant(cat, category.id))) {
        return acc;
      }

      const indent = '　'.repeat(depth); // 전각 공백으로 들여쓰기
      acc.push(
        <option key={cat.id} value={cat.id}>
          {indent}{cat.name}
        </option>
      );

      if (cat.children && cat.children.length > 0) {
        acc.push(...renderCategoryOptions(cat.children, depth + 1));
      }

      return acc;
    }, []);
  };

  // 하위 카테고리인지 확인하는 함수
  const isDescendant = (parentCat: ProductCategory, targetId: string): boolean => {
    if (!parentCat.children) return false;
    return parentCat.children.some(child => 
      child.id === targetId || isDescendant(child, targetId)
    );
  };

  const title = category ? '카테고리 수정' : '새 카테고리 추가';
  const parentInfo = parent ? `"${parent.name}"의 하위 카테고리` : '최상위 카테고리';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-2">
              상위 카테고리
            </label>
            <select
              id="parentCategory"
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">최상위 카테고리</option>
              {renderCategoryOptions(availableParents)}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 에센스/세럼"
              autoFocus
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              설명 (선택사항)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="카테고리에 대한 간단한 설명"
              rows={3}
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {category ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEditModal;