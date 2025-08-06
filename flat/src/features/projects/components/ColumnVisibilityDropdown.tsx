import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import type { Column } from '../../../hooks/useColumnOrder';

interface ColumnVisibilityDropdownProps {
  columns: Column[];
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({
  columns,
  hiddenColumns,
  onToggleColumn,
  onShowAll,
  onHideAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const visibleCount = columns.filter(col => !hiddenColumns.has(col.id)).length;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        <span>열 표시 ({visibleCount}/{columns.length})</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
          {visibleCount > 0 && (
            <div className="p-2 border-b border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={onShowAll}
                  className="flex-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                >
                  모두 표시
                </button>
                <button
                  onClick={onHideAll}
                  className="flex-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                >
                  모두 숨기기
                </button>
              </div>
            </div>
          )}
          <div className="max-h-96 overflow-y-auto">
            {visibleCount === 0 && (
              <div className="p-4 text-center">
                <div className="text-sm text-gray-500 mb-3">모든 열이 숨겨져 있습니다</div>
                <button
                  onClick={onShowAll}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                >
                  모두 표시
                </button>
              </div>
            )}
            {columns.map((column) => {
              const isVisible = !hiddenColumns.has(column.id);
              return (
                <div
                  key={column.id}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onToggleColumn(column.id)}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{column.label}</span>
                  </div>
                  {isVisible ? (
                    <Eye className="w-4 h-4 text-gray-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnVisibilityDropdown;