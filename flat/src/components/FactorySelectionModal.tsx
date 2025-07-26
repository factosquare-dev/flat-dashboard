import React, { useState, useMemo } from 'react';
import { factories, type Factory } from '../data/factories';
import BaseModal from './common/BaseModal';
import { Search } from 'lucide-react';
import { FactoryType, FactoryTypeLabel, ModalSize } from '../types/enums';
import { MODAL_SIZES } from '../utils/modalUtils';
import FactoryTypeBadge from './common/FactoryTypeBadge';
import { useDebouncedSearch } from '../hooks/common';
import { cn } from '../utils/cn';
import './FactorySelectionModal.css';

interface FactorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFactorySelect: (factory: Factory) => void;
}

// Using FactoryType enum from types/enums.ts

const FactorySelectionModal: React.FC<FactorySelectionModalProps> = ({
  isOpen,
  onClose,
  onFactorySelect,
}) => {
  const [selectedType, setSelectedType] = useState<FactoryType>(FactoryType.MANUFACTURING);
  
  // Use debounced search hook
  const { searchValue, debouncedValue, setSearchValue } = useDebouncedSearch({
    delay: 300,
    minLength: 1
  });

  // 필터링된 공장 리스트
  const filteredFactories = useMemo(() => {
    let filtered = factories;
    
    // 타입 필터링
    filtered = filtered.filter(factory => factory.type === selectedType);
    
    // 검색어 필터링 - use debounced value
    if (debouncedValue.trim()) {
      filtered = filtered.filter(factory => 
        factory.name.toLowerCase().includes(debouncedValue.toLowerCase()) ||
        factory.address.toLowerCase().includes(debouncedValue.toLowerCase())
      );
    }
    
    return filtered;
  }, [selectedType, debouncedValue]);

  const handleFactoryClick = (factory: Factory) => {
    onFactorySelect(factory);
    onClose();
    setSearchValue('');
    setSelectedType(FactoryType.MANUFACTURING);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="공장 선택"
      size={MODAL_SIZES.LARGE}
    >
      <div className="modal-section-spacing">

        {/* 필터 및 검색 */}
        <div className="modal-field-spacing">
          {/* 타입 필터 */}
          <div className="factory-modal__type-filter">
            {Object.entries(FactoryTypeLabel).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key as FactoryType)}
                className={cn(
                  'factory-modal__type-button',
                  selectedType === key && 'factory-modal__type-button--selected'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 검색바 */}
          <div className="factory-modal__search-container">
            <input
              type="text"
              placeholder="공장명 또는 주소로 검색..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="factory-modal__search-input"
            />
            <Search className="factory-modal__search-icon" />
          </div>
        </div>

        {/* 공장 리스트 */}
        <div className="factory-modal__list">
          {filteredFactories.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFactories.map((factory) => (
                <div
                  key={factory.id}
                  onClick={() => handleFactoryClick(factory)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {factory.name}
                        </h3>
                        <FactoryTypeBadge type={factory.type} showLabel={false} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {factory.address}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{factory.contact}</span>
                        <span>{factory.capacity}</span>
                      </div>
                      {factory.certifications.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {factory.certifications.slice(0, 3).map((cert) => (
                            <span
                              key={cert}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {cert}
                            </span>
                          ))}
                          {factory.certifications.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              +{factory.certifications.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <button className="text-blue-500 hover:text-blue-700 font-medium text-sm">
                        선택
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          총 {filteredFactories.length}개의 공장이 검색되었습니다.
        </div>
      </div>
    </BaseModal>
  );
};

export default FactorySelectionModal;