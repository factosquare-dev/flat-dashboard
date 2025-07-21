import React, { useState, useRef, useEffect } from 'react';
import { factories } from '../../data/factories';
import BaseModal, { ModalFooter } from '../common/BaseModal';
import { useDragSelection } from '../../hooks/useDragSelection';

interface Factory {
  id: string;
  name: string;
  type: '제조' | '용기' | '포장';
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
  const [selectedType, setSelectedType] = useState<'all' | '제조' | '용기' | '포장'>('all');
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case '제조': return 'bg-blue-100 text-blue-700 border-blue-300';
      case '용기': return 'bg-red-100 text-red-700 border-red-300';
      case '포장': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

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
      size="lg"
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
      <div className="space-y-4 mb-6">
        {/* 검색 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">공장 검색</label>
          <input
            type="text"
            placeholder="공장명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 타입 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">공장 유형</label>
          <div className="flex gap-2 flex-wrap">
            {(['all', '제조', '용기', '포장'] as const).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                  selectedType === type
                    ? type === '제조' 
                      ? 'bg-blue-600 text-white shadow-md'
                      : type === '용기'
                      ? 'bg-red-600 text-white shadow-md'
                      : type === '포장'
                      ? 'bg-yellow-600 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? '전체' : type}
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(factory.type)}`}>
                            {factory.type}
                          </span>
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