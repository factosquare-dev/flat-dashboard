import React, { useRef, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';

interface SearchDropdownProps<T> {
  isOpen: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  items: T[];
  selectedItems?: T | T[];
  onSelect: (item: T) => void;
  onRemove?: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  renderSelected?: (item: T) => React.ReactNode;
  placeholder?: string;
  buttonText?: string;
  emptyMessage?: string;
  multiple?: boolean;
  compact?: boolean;
}

function SearchDropdown<T extends { id: string }>({
  isOpen,
  onClose,
  searchValue,
  onSearchChange,
  items,
  selectedItems,
  onSelect,
  onRemove,
  renderItem,
  renderSelected,
  placeholder = '검색...',
  buttonText = '선택',
  emptyMessage = '검색 결과가 없습니다',
  multiple = false,
  compact = true,
}: SearchDropdownProps<T>) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const isSelected = (item: T) => {
    if (!selectedItems) return false;
    if (Array.isArray(selectedItems)) {
      return selectedItems.some(selected => selected.id === item.id);
    }
    return selectedItems.id === item.id;
  };

  const handleItemClick = (item: T) => {
    onSelect(item);
    if (!multiple) {
      onClose();
    }
  };

  const selectedArray = Array.isArray(selectedItems) ? selectedItems : (selectedItems ? [selectedItems] : []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected Items */}
      {selectedArray.length > 0 && renderSelected ? (
        <div className={compact ? "space-y-1" : "space-y-2 mb-2"}>
          {selectedArray.map(item => (
            <div key={item.id} className={`flex items-center gap-2 ${compact ? 'p-2 bg-gray-50 border border-gray-200 rounded-lg' : 'p-3 bg-gray-50 border-2 border-gray-300 rounded-xl'}`}>
              {renderSelected(item)}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className={`${compact ? 'p-0.5' : 'p-1.5'} hover:bg-gray-200 rounded transition-colors`}
                >
                  <X className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 hover:text-gray-700`} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Toggle Button */}
      {(!selectedItems || (Array.isArray(selectedItems) && selectedItems.length === 0) || 
        (multiple && selectedArray.length < items.length)) && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className={`w-full flex items-center gap-2 ${compact ? 'px-3 py-2 border border-gray-200 rounded-lg text-sm' : 'px-4 py-3 border-2 border-gray-300 rounded-xl text-base'} bg-white hover:border-gray-400 hover:bg-gray-50 transition-all group`}
        >
          <Plus className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 group-hover:text-gray-700`} />
          <span className={`${compact ? 'text-sm' : 'text-base font-medium'} text-gray-600 group-hover:text-gray-800`}>{buttonText}</span>
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 bg-white ${compact ? 'border border-gray-200 rounded-lg' : 'border-2 border-gray-300 rounded-xl'} shadow-xl overflow-hidden`}>
          <div className={`${compact ? 'p-2 bg-gray-50 border-b border-gray-100' : 'p-3 bg-gray-100 border-b-2 border-gray-200'}`}>
            <div className="relative">
              <Search className={`absolute ${compact ? 'left-2' : 'left-3'} top-1/2 -translate-y-1/2 ${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500`} />
              <input
                type="text"
                className={`w-full ${compact ? 'pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded' : 'pl-10 pr-4 py-2 text-base border-2 border-gray-300 rounded-lg'} bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400`}
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className={`${compact ? 'max-h-48' : 'max-h-56'} overflow-y-auto`}>
            {items.length > 0 ? (
              items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  disabled={isSelected(item)}
                  className={`w-full flex items-center gap-2 ${compact ? 'px-3 py-2' : 'px-4 py-3'} transition-colors ${
                    isSelected(item) 
                      ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {renderItem(item)}
                </button>
              ))
            ) : (
              <div className={`${compact ? 'px-3 py-4 text-sm' : 'px-4 py-6 text-base'} text-center text-gray-600`}>
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchDropdown;