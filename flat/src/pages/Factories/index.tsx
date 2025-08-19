import React, { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFactories, type Factory as FactoryType } from '@/data/factories';
import FactoryModal, { type FactoryFormData } from '@/components/Factories/FactoryModal';
import FactoryCard from '@/components/Factories/FactoryCard';
import FactoryToolbar from '@/components/Factories/FactoryToolbar';
import FloatingActionButton from '@/components/common/FloatingActionButton';
import { useFactoryFilter } from '@/hooks/useFactoryFilter';
import { useModalState } from '@/hooks/useModalState';
import { Building2, Tags } from 'lucide-react';
import { LoadingState } from '@/components/loading/LoadingState';
import { logError } from '@/utils/error';
import { useToast } from '@/hooks/useToast';
import { ButtonVariant } from '@/types/enums';

const FactoriesPage: React.FC = () => {
  const modalState = useModalState<FactoryType | null>(false, null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [factories, setFactories] = useState<FactoryType[]>([]);
  
  // Load factories on component mount
  useEffect(() => {
    const loadedFactories = getFactories();
    setFactories(loadedFactories);
  }, []);
  
  // 필터링 로직을 커스텀 훅으로 분리
  const {
    selectedType,
    searchTerm,
    filteredFactories,
    setSelectedType,
    setSearchTerm,
  } = useFactoryFilter(factories);

  const handleAddFactory = useCallback(() => {
    modalState.open(null);
  }, [modalState]);

  const handleEditFactory = useCallback((factory: FactoryType) => {
    modalState.open(factory);
  }, [modalState]);

  const handleDeleteFactory = useCallback(async (factoryId: string) => {
    try {
      // TODO: API 연동 시 실제 삭제 로직 구현
      showToast('공장이 삭제되었습니다', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '공장 삭제에 실패했습니다';
      logError('FactoriesPage', error, { action: 'deleteFactory', factoryId });
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  const handleSaveFactory = useCallback(async (factoryData: FactoryFormData) => {
    try {
      setIsLoading(true);
      // TODO: API 연동 시 실제 저장 로직 구현
      modalState.close();
      showToast('공장 정보가 저장되었습니다', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '공장 저장에 실패했습니다';
      logError('FactoriesPage', error, { action: 'saveFactory', data: factoryData });
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [modalState, showToast]);

  const handleCloseModal = useCallback(() => {
    modalState.close();
  }, [modalState]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 상단 툴바 */}
      <FactoryToolbar
        selectedType={selectedType}
        searchTerm={searchTerm}
        onTypeChange={setSelectedType}
        onSearchChange={setSearchTerm}
      />

      {/* 관리 메뉴 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-medium text-gray-600">관리 메뉴</h2>
          <Link
            to="/factories/product-types"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Tags className="w-4 h-4" />
            제품유형 카테고리 관리
          </Link>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-auto p-6">
        {/* 공장 개수 표시 */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            총 {filteredFactories.length}개의 공장
          </p>
        </div>

        {/* 공장 카드 그리드 */}
        <LoadingState
          isLoading={isLoading}
          error={error}
          isEmpty={filteredFactories.length === 0}
          emptyComponent={
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-gray-400 mb-4">
                <Building2 className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? '검색 결과가 없습니다' : '등록된 공장이 없습니다'}
              </h3>
              <p className="text-sm text-gray-600">
                {searchTerm ? '다른 검색어를 시도해보세요' : '새로운 공장을 추가해보세요'}
              </p>
            </div>
          }
        >
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
        </LoadingState>

      </div>

      {/* 플로팅 액션 버튼 - 새 공장 추가 */}
      <FloatingActionButton
        onClick={handleAddFactory}
        icon={<Building2 />}
        label="새 공장 추가"
        variant={ButtonVariant.PRIMARY}
        position="first"
      />

      {/* 공장 추가/수정 모달 */}
      <FactoryModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveFactory}
        editData={modalState.data ? modalState.data as FactoryFormData : null}
      />
    </div>
  );
};

export default FactoriesPage;