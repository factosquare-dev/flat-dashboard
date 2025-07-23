import React, { useState, useMemo } from 'react';
import { factories, type Factory } from '../data/factories';

interface FactorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFactorySelect: (factory: Factory) => void;
}

type FactoryType = '제조' | '용기' | '포장';

const FactorySelectionModal: React.FC<FactorySelectionModalProps> = ({
  isOpen,
  onClose,
  onFactorySelect,
}) => {
  const [selectedType, setSelectedType] = useState<FactoryType>('제조');
  const [searchTerm, setSearchTerm] = useState('');

  // 필터링된 공장 리스트
  const filteredFactories = useMemo(() => {
    let filtered = factories;
    
    // 타입 필터링
    filtered = filtered.filter(factory => factory.type === selectedType);
    
    // 검색어 필터링
    if (searchTerm.trim()) {
      filtered = filtered.filter(factory => 
        factory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [selectedType, searchTerm]);

  const handleFactoryClick = (factory: Factory) => {
    onFactorySelect(factory);
    onClose();
    setSearchTerm('');
    setSelectedType('제조');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">공장 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 필터 및 검색 */}
        <div className="px-6 py-4 border-b space-y-4">
          {/* 타입 필터 */}
          <div className="flex gap-2">
            {(['제조', '용기', '포장'] as FactoryType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* 검색바 */}
          <div className="relative">
            <input
              type="text"
              placeholder="공장명 또는 주소로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 공장 리스트 */}
        <div className="flex-1 overflow-y-auto">
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          factory.type === '제조' ? 'bg-blue-100 text-blue-800' :
                          factory.type === '용기' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {factory.type}
                        </span>
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
        <div className="px-6 py-4 border-t bg-gray-50 text-sm text-gray-600">
          총 {filteredFactories.length}개의 공장이 검색되었습니다.
        </div>
      </div>
    </div>
  );
};

export default FactorySelectionModal;