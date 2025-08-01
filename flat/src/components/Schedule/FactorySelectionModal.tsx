import React, { useState, useRef, useEffect } from 'react';
import { factories } from '@/data/factories';
import BaseModal, { ModalFooter } from '../common/BaseModal';
import { useDragSelection } from '@/hooks/useDragSelection';
import { MODAL_SIZES } from '@/utils/modalUtils';
import { FactoryType, FactoryTypeLabel } from '@/types/enums';
import FactoryTypeBadge from '../common/FactoryTypeBadge';
import { ModalSize } from '@/types/enums';

interface Factory {
  id: string;
  name: string;
  type: FactoryType;
  location?: string;
  contact?: string;
}

interface FactorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFactories: (factories: Factory[]) => void;
}

const FactorySelectionModal: React.FC<FactorySelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectFactories
}) => {
  const [selectedType, setSelectedType] = useState<'all' | FactoryType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactoryIds, setSelectedFactoryIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredFactories = factories.filter(factory => {
    const matchesType = selectedType === 'all' || factory.type === selectedType;
    const matchesSearch = factory.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const {
    isDragging,
    handleStartDrag,
    handleMouseEnterItem,
    handleEndDrag,
    handleSelectItem,
    setupAutoScroll
  } = useDragSelection({
    items: filteredFactories,
    selectedItems: selectedFactoryIds,
    onSelectionChange: setSelectedFactoryIds,
    getItemId: (factory) => factory.id
  });

  useEffect(() => {
    return setupAutoScroll(containerRef.current);
  }, [setupAutoScroll]);

  // 모달이 열릴 때 선택 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedFactoryIds([]);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const selectedFactoriesList = factories.filter(f => selectedFactoryIds.includes(f.id));
    onSelectFactories(selectedFactoriesList);
    setSelectedFactoryIds([]);
    onClose();
  };

  const handleSelectAll = () => {
    if (selectedFactoryIds.length === filteredFactories.length) {
      setSelectedFactoryIds([]);
    } else {
      setSelectedFactoryIds(filteredFactories.map(f => f.id));
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="공장 선택"
      description="간트차트에 추가할 공장을 선택해주세요"
      size={MODAL_SIZES.LARGE}
      footer={
        <ModalFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedFactoryIds.length === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedFactoryIds.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            선택 완료 ({selectedFactoryIds.length}개)
          </button>
        </ModalFooter>
      }
    >
      {/* 검색 및 필터 */}
      <div className="modal-section-spacing">
        {/* 검색 */}
        <div className="modal-field-spacing">
          <label className="modal-field-label">공장 검색</label>
          <input
            type="text"
            placeholder="공장명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="modal-input"
          />
        </div>

        {/* 타입 필터 */}
        <div className="modal-field-spacing">
          <label className="modal-field-label">공장 유형</label>
          <div className="flex flex-wrap" style={{gap: 'var(--modal-gap-sm)'}}>
            {(['all', ...Object.values(FactoryType)] as const).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`modal-button-compact ${
                  selectedType === type ? 'selected' : ''
                }`}
                style={{fontSize: 'var(--modal-text-xs)'}}
              >
                {type === 'all' ? '전체' : FactoryTypeLabel[type as FactoryType]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 공장 목록 */}
      <div className="border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            공장 목록 ({filteredFactories.length}개)
          </span>
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {selectedFactoryIds.length === filteredFactories.length ? '전체 해제' : '전체 선택'}
          </button>
        </div>
        
        <div 
          ref={containerRef}
          className="max-h-80 overflow-y-auto"
          onMouseUp={handleEndDrag}
          onMouseLeave={handleEndDrag}
        >
          {filteredFactories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🏭</div>
              <p className="text-base">조건에 맞는 공장이 없습니다.</p>
              <p className="text-sm mt-1">검색어나 필터를 변경해보세요.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFactories.map((factory, index) => {
                const isSelected = selectedFactoryIds.includes(factory.id);
                return (
                  <div
                    key={factory.id}
                    className={`p-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => handleMouseEnterItem(index)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectItem(factory.id, e.target.checked);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (index !== undefined) {
                            handleStartDrag(index);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (isDragging && e.buttons === 1) {
                            e.stopPropagation();
                          }
                        }}
                        className="w-4 h-4 rounded border border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        style={{ userSelect: 'none' }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{factory.name}</h3>
                          <FactoryTypeBadge type={factory.type} size={ModalSize.SM} showLabel={false} />
                        </div>
                        {factory.location && (
                          <p className="text-sm text-gray-600 mb-1">📍 {factory.location}</p>
                        )}
                        {factory.contact && (
                          <p className="text-sm text-gray-500">📞 {factory.contact}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default FactorySelectionModal;