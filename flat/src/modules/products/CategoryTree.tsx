import React, { useState } from 'react';
import { ChevronRight, ChevronDown, MoreVertical, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import type { ProductCategory, ProductCategoryId } from '@/shared/types/productCategory';

interface CategoryTreeProps {
  categories: ProductCategory[];
  onAdd: (parent?: ProductCategory) => void;
  onEdit: (category: ProductCategory, parent?: ProductCategory) => void;
  onDelete: (categoryId: ProductCategoryId) => void;
  onMove: (draggedId: ProductCategoryId, targetId: ProductCategoryId | null, position: 'before' | 'after' | 'inside') => void;
}

interface CategoryNodeProps {
  category: ProductCategory;
  depth: number;
  onAdd: (parent?: ProductCategory) => void;
  onEdit: (category: ProductCategory, parent?: ProductCategory) => void;
  onDelete: (categoryId: ProductCategoryId) => void;
  onMove: (draggedId: ProductCategoryId, targetId: ProductCategoryId | null, position: 'before' | 'after' | 'inside') => void;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  depth,
  onAdd,
  onEdit,
  onDelete,
  onMove
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState<'before' | 'after' | 'inside' | null>(null);

  const hasChildren = category.children && category.children.length > 0;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('categoryId', category.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    if (y < height * 0.25) {
      setDragOver('before');
    } else if (y > height * 0.75) {
      setDragOver('after');
    } else {
      setDragOver('inside');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = e.dataTransfer.getData('categoryId') as ProductCategoryId;
    if (draggedId && dragOver) {
      onMove(draggedId, category.id, dragOver);
    }
    setDragOver(null);
  };

  return (
    <div className="select-none">
      <div
        className={`
          group flex items-center py-3 px-4 rounded-lg mb-2 transition-all border border-transparent
          ${isDragging ? 'opacity-50' : ''}
          ${dragOver === 'before' ? 'border-t-2 border-blue-500' : ''}
          ${dragOver === 'after' ? 'border-b-2 border-blue-500' : ''}
          ${dragOver === 'inside' ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50 hover:shadow-sm'}
        `}
        style={{ marginLeft: `${depth * 24}px` }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        
        {/* 확장/축소 버튼 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${!hasChildren ? 'invisible' : ''}`}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>


        {/* 카테고리 이름 */}
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-gray-900">{category.name}</span>
            {category.description && (
              <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {category.description}
              </span>
            )}
          </div>
        </div>

        {/* 액션 메뉴 */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  onAdd(category);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                하위 카테고리 추가
              </button>
              <button
                onClick={() => {
                  onEdit(category);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                수정
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  if (confirm(`"${category.name}" 카테고리를 삭제하시겠습니까? 하위 카테고리도 함께 삭제됩니다.`)) {
                    onDelete(category.id);
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 자식 카테고리 */}
      {isExpanded && hasChildren && (
        <div>
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onAdd,
  onEdit,
  onDelete,
  onMove
}) => {
  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">카테고리를 추가해보세요</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            제품을 체계적으로 관리하기 위해 카테고리를 만들어보세요.<br/>
            예: 스킨케어 → 토너/미스트, 에센스/세럼
          </p>
        </div>
        <button
          onClick={() => onAdd()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          첫 번째 카테고리 만들기
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-2">
        {categories.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            depth={0}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryTree;