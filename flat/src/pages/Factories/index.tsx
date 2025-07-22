import React, { useState, useCallback } from 'react';
import { factories, type Factory as FactoryType } from '../../data/factories';
import FactoryModal, { type FactoryFormData } from '../../components/Factories/FactoryModal';
import FactoryCard from '../../components/Factories/FactoryCard';
import FactoryToolbar from '../../components/Factories/FactoryToolbar';
import { useFactoryFilter } from '../../hooks/useFactoryFilter';

const FactoriesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<FactoryType | null>(null);
  
  // 필터링 로직을 커스텀 훅으로 분리
  const {
    selectedType,
    searchTerm,
    filteredFactories,
    setSelectedType,
    setSearchTerm,
  } = useFactoryFilter(factories);

  const handleAddFactory = useCallback(() => {
    setEditingFactory(null);
    setIsModalOpen(true);
  }, []);

  const handleEditFactory = useCallback((factory: FactoryType) => {
    setEditingFactory(factory);
    setIsModalOpen(true);
  }, []);

  const handleDeleteFactory = useCallback((factoryId: string) => {
    // TODO: API 연동 시 실제 삭제 로직 구현
    console.log('Delete factory:', factoryId);
  }, []);

  const handleSaveFactory = useCallback((factoryData: FactoryFormData) => {
    // TODO: API 연동 시 실제 저장 로직 구현
    console.log('Save factory:', factoryData);
    setIsModalOpen(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingFactory(null);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 상단 툴바 */}
      <FactoryToolbar
        selectedType={selectedType}
        searchTerm={searchTerm}
        onTypeChange={setSelectedType}
        onSearchChange={setSearchTerm}
        onAddFactory={handleAddFactory}
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-auto p-6">
        {/* 공장 개수 표시 */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            총 {filteredFactories.length}개의 공장
          </p>
        </div>

        {/* 공장 카드 그리드 */}
        {filteredFactories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFactories.map((factory) => (
              <FactoryCard
                key={factory.id}
                factory={factory}
                onEdit={handleEditFactory}
                onDelete={handleDeleteFactory}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-lg mb-2">검색 결과가 없습니다</p>
            <p className="text-sm">다른 검색어를 시도해보세요</p>
          </div>
        )}

      </div>

      {/* 공장 추가/수정 모달 */}
      <FactoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveFactory}
        editData={editingFactory as FactoryFormData | null}
      />
    </div>
  );
};

export default FactoriesPage;