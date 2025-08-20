import React, { useState, useMemo, useRef, useEffect } from 'react';
import { getFactories, type Factory } from '@/core/database/factories';
import BaseModal, { ModalFooter } from './common/BaseModal';
import { Search } from 'lucide-react';
import { FactoryType, FactoryTypeLabel, ModalSize } from '@/shared/types/enums';
import { MODAL_SIZES } from '@/shared/utils/modalUtils';
import FactoryTypeBadge from './common/FactoryTypeBadge';
import { useDebouncedSearch } from '@/shared/hooks/common';
import { useDragSelection } from '@/shared/hooks/useDragSelection';
import { cn } from '@/shared/utils/cn';

interface FactorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFactorySelect?: (factory: Factory) => void; // For single selection
  onSelectFactories?: (factories: Factory[]) => void; // For multiple selection
  multiSelect?: boolean; // Enable multi-selection mode
  selectedFactoryIds?: string[]; // Pre-selected factories for multi-select
}

const FactorySelectionModal: React.FC<FactorySelectionModalProps> = ({
  isOpen,
  onClose,
  onFactorySelect,
  onSelectFactories,
  multiSelect = false,
  selectedFactoryIds = []
}) => {
  const [selectedType, setSelectedType] = useState<'all' | FactoryType>(multiSelect ? 'all' : FactoryType.MANUFACTURING);
  const [selectedFactories, setSelectedFactories] = useState<string[]>(() => selectedFactoryIds || []);
  const [factories, setFactories] = useState<Factory[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load factories on component mount
  useEffect(() => {
    const loadedFactories = getFactories();
    setFactories(loadedFactories);
  }, []);
  
  // Use debounced search hook
  const { searchValue, debouncedValue, setSearchValue } = useDebouncedSearch({
    delay: 300,
    minLength: 1
  });

  // For multi-select drag functionality
  const {
    isDragging,
    handleStartDrag,
    handleMouseEnterItem,
    handleEndDrag,
    handleSelectItem,
  } = useDragSelection({
    items: factories,
    selectedItems: selectedFactories,
    onSelectionChange: setSelectedFactories,
    getItemId: (factory) => factory.id,
    enabled: multiSelect
  });

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      // Initialize with provided IDs or empty array
      setSelectedFactories(selectedFactoryIds || []);
    }
  }, [isOpen, selectedFactoryIds]);

  const filteredFactories = useMemo(() => {
    return factories.filter(factory => {
      const matchesType = selectedType === 'all' || factory.type === selectedType;
      const matchesSearch = !debouncedValue || 
        factory.name.toLowerCase().includes(debouncedValue.toLowerCase()) ||
        factory.location?.toLowerCase().includes(debouncedValue.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [selectedType, debouncedValue]);

  const handleFactoryClick = (factory: Factory) => {
    if (multiSelect) {
      handleSelectItem(factory.id);
    } else {
      onFactorySelect?.(factory);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    const selected = factories.filter(f => selectedFactories.includes(f.id));
    onSelectFactories?.(selected);
    onClose();
  };

  const handleClose = () => {
    setSearchValue('');
    // Don't reset selectedFactories here to avoid re-render issues
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={multiSelect ? "공장 할당 (다중 선택)" : "태스크에 공장 할당"}
      description={multiSelect ? "드래그하거나 클릭하여 태스크에 할당할 공장들을 선택하세요" : "현재 태스크에 할당할 공장을 선택하세요"}
      size={MODAL_SIZES[ModalSize.MD]}
      footer={
        multiSelect && (
          <ModalFooter>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedFactories.length === 0}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              선택 완료 ({selectedFactories.length})
            </button>
          </ModalFooter>
        )
      }
    >
      <div className="factory-selection-modal">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="공장명 또는 위치로 검색..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex space-x-2 mb-4 border-b">
          {multiSelect && (
            <button
              onClick={() => setSelectedType('all')}
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                selectedType === 'all'
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              )}
            >
              전체
            </button>
          )}
          {Object.values(FactoryType).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                selectedType === type
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              )}
            >
              {FactoryTypeLabel[type]}
            </button>
          ))}
        </div>

        {/* Factory List */}
        <div 
          ref={containerRef}
          className="space-y-2 max-h-96 overflow-y-auto"
          onMouseUp={handleEndDrag}
          onMouseLeave={handleEndDrag}
        >
          {filteredFactories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {debouncedValue ? '검색 결과가 없습니다' : '등록된 공장이 없습니다'}
            </div>
          ) : (
            filteredFactories.map((factory, index) => (
              <div
                key={factory.id}
                className={cn(
                  "factory-item p-4 rounded-lg border cursor-pointer transition-all",
                  multiSelect && selectedFactories.includes(factory.id)
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white border-gray-200 hover:bg-gray-50",
                  isDragging && "select-none"
                )}
                onClick={() => handleFactoryClick(factory)}
                onMouseDown={() => multiSelect && handleStartDrag(index)}
                onMouseEnter={() => multiSelect && handleMouseEnterItem(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{factory.name}</h3>
                    {factory.location && (
                      <p className="text-sm text-gray-500 mt-1">{factory.location}</p>
                    )}
                  </div>
                  <FactoryTypeBadge type={factory.type} />
                </div>
                {factory.contact && (
                  <p className="text-sm text-gray-600 mt-2">담당자: {factory.contact}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default FactorySelectionModal;