import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus } from 'lucide-react';

export interface SelectorOption {
  id: string;
  name: string;
  [key: string]: any; // Additional properties for specific selectors
}

export interface BaseSelectorProps {
  options: SelectorOption[];
  selectedOptions: SelectorOption[];
  placeholder?: string;
  onSelectionChange: (options: SelectorOption[]) => void;
  multiSelect?: boolean;
  required?: boolean;
  searchPlaceholder?: string;
  addNewText?: string;
  onAddNew?: () => void;
  renderOption?: (option: SelectorOption) => React.ReactNode;
  renderSelectedItem?: (option: SelectorOption, onRemove: () => void) => React.ReactNode;
  className?: string;
}

// Korean initial consonant search helper
const getKoreanInitials = (str: string): string => {
  const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  let result = '';
  
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code >= 0 && code <= 11171) {
      result += initials[Math.floor(code / 588)];
    } else {
      result += str[i];
    }
  }
  
  return result;
};

export const BaseSelector: React.FC<BaseSelectorProps> = ({
  options,
  selectedOptions,
  placeholder = "선택하세요",
  onSelectionChange,
  multiSelect = false,
  required = false,
  searchPlaceholder = "검색...",
  addNewText = "새로 추가",
  onAddNew,
  renderOption,
  renderSelectedItem,
  className = ""
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter(option => {
    const query = searchQuery.toLowerCase();
    const queryInitials = getKoreanInitials(searchQuery);
    
    // Search in name
    if (option.name.toLowerCase().includes(query)) return true;
    // Korean initial search for name
    if (getKoreanInitials(option.name).includes(queryInitials)) return true;
    
    // Search in company if it exists (for customer selector)
    if (option.company) {
      if (option.company.toLowerCase().includes(query)) return true;
      // Korean initial search for company
      if (getKoreanInitials(option.company).includes(queryInitials)) return true;
    }
    
    // Search in any other searchable fields
    if (option.searchableText && option.searchableText.toLowerCase().includes(query)) return true;
    
    return false;
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        if (!target || (target as Element).closest?.('[data-dropdown]') !== dropdownRef.current) {
          setShowSearch(false);
          setSearchQuery('');
        }
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearch]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleOptionClick = (option: SelectorOption) => {
    if (multiSelect) {
      const isSelected = selectedOptions.some(selected => selected.id === option.id);
      if (isSelected) {
        // Remove option
        onSelectionChange(selectedOptions.filter(selected => selected.id !== option.id));
      } else {
        // Add option
        onSelectionChange([...selectedOptions, option]);
      }
    } else {
      // Single select
      onSelectionChange([option]);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleRemoveOption = (optionId: string) => {
    onSelectionChange(selectedOptions.filter(selected => selected.id !== optionId));
  };

  const handleToggleDropdown = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  const defaultRenderOption = (option: SelectorOption) => (
    <div className="flex items-center justify-between">
      <span>{option.name}</span>
    </div>
  );

  const defaultRenderSelectedItem = (option: SelectorOption, onRemove: () => void) => (
    <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
      <span>{option.name}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef} data-dropdown>
      {/* Selected items display */}
      <div 
        className={`border rounded-md px-3 py-2 cursor-pointer ${
          required && selectedOptions.length === 0 ? 'border-red-300' : 'border-gray-300'
        }`}
        onClick={handleToggleDropdown}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : multiSelect ? (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map(option => 
              renderSelectedItem 
                ? renderSelectedItem(option, () => handleRemoveOption(option.id))
                : defaultRenderSelectedItem(option, () => handleRemoveOption(option.id))
            )}
          </div>
        ) : (
          <span>{selectedOptions[0].name}</span>
        )}
      </div>

      {/* Dropdown */}
      {showSearch && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Search input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-gray-500 text-center">
                검색 결과가 없습니다
              </div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = selectedOptions.some(selected => selected.id === option.id);
                return (
                  <div
                    key={option.id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${
                      isSelected ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    onClick={() => handleOptionClick(option)}
                  >
                    {renderOption ? renderOption(option) : defaultRenderOption(option)}
                  </div>
                );
              })
            )}
          </div>

          {/* Add new option */}
          {onAddNew && (
            <div 
              className="p-2 border-t cursor-pointer hover:bg-gray-100 flex items-center gap-2"
              onClick={onAddNew}
            >
              <Plus className="w-4 h-4" />
              <span>{addNewText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};