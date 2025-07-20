import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { factories, type Factory } from '../../data/factories';
import FactoryModal, { type FactoryFormData } from '../../components/Factories/FactoryModal';

const FactoriesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  const [selectedTab, setSelectedTab] = useState<'factory' | 'product'>('factory');
  const [selectedType, setSelectedType] = useState<'제조' | '용기' | '포장'>('제조');
  
  const filteredFactories = factories.filter(factory => factory.type === selectedType);

  const handleAddFactory = () => {
    setEditingFactory(null);
    setIsModalOpen(true);
  };

  const handleEditFactory = (factory: Factory) => {
    setEditingFactory(factory);
    setIsModalOpen(true);
  };

  const handleSaveFactory = (factoryData: FactoryFormData) => {
    // TODO: API 연동 시 실제 저장 로직 구현
  };

  const getTypeButtonClass = (type: '제조' | '용기' | '포장') => {
    return selectedType === type
      ? 'px-4 py-2 bg-blue-500 text-white rounded-lg'
      : 'px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50';
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="flex h-full">
        {/* 왼쪽 사이드바 */}
        <div className="w-48 bg-white border-r">
          <div className="p-4">
            <button
              onClick={() => setSelectedTab('factory')}
              className={`w-full px-4 py-2 mb-2 text-left rounded ${
                selectedTab === 'factory' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              공장
            </button>
            <button
              onClick={() => setSelectedTab('product')}
              className={`w-full px-4 py-2 text-left rounded ${
                selectedTab === 'product' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              제품
            </button>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 p-6">
          {/* 탭 버튼 */}
          <div className="flex gap-2 mb-6">
            <button className="px-6 py-2 rounded-full bg-gray-600 text-white">
              공장 관리
            </button>
          </div>

          {/* 공장 유형 필터 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedType('제조')}
              className={getTypeButtonClass('제조')}
            >
              제조사
            </button>
            <button
              onClick={() => setSelectedType('용기')}
              className={getTypeButtonClass('용기')}
            >
              용기사
            </button>
            <button
              onClick={() => setSelectedType('포장')}
              className={getTypeButtonClass('포장')}
            >
              패키지사
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
              검색
            </button>
            <div className="flex-1"></div>
            <div className="flex gap-2">
              <button
                onClick={handleAddFactory}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                + 인증서 추가
              </button>
              <button
                onClick={handleAddFactory}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                + 새 공장 추가
              </button>
            </div>
          </div>

          {/* 공장 카드 목록 */}
          <div className="space-y-4">
            {filteredFactories.map((factory) => (
              <div key={factory.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-lg font-medium">{factory.name}</h3>
                      <button className="px-3 py-1 text-sm bg-gray-200 rounded">
                        수정
                      </button>
                      <button className="px-3 py-1 text-sm bg-gray-200 rounded">
                        삭제
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">담당자:</span> {factory.managers?.[0]?.name || '미지정'}
                      </div>
                      <div>
                        <span className="text-gray-500">연락처:</span> {factory.contact}
                      </div>
                      <div>
                        <span className="text-gray-500">이메일:</span> {factory.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                {factory.certifications.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {factory.certifications.map((cert, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 공장 추가/수정 모달 */}
          <FactoryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveFactory}
            editData={editingFactory as FactoryFormData | null}
          />
        </div>
      </div>
    </div>
  );
};

export default FactoriesPage;