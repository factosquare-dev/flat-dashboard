import React from 'react';
import { Search } from 'lucide-react';
import type { FactoryType } from '../../hooks/useFactoryFilter';

interface FactoryToolbarProps {
  selectedType: FactoryType;
  searchTerm: string;
  onTypeChange: (type: FactoryType) => void;
  onSearchChange: (term: string) => void;
}

const FACTORY_TYPES: FactoryType[] = ['제조', '용기', '포장'];

const FactoryToolbar: React.FC<FactoryToolbarProps> = ({
  selectedType,
  searchTerm,
  onTypeChange,
  onSearchChange,
}) => {
  const getTypeButtonClass = (type: FactoryType) => {
    return selectedType === type
      ? 'px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-200'
      : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 타입 필터 */}
        <div className="flex gap-3">
          {FACTORY_TYPES.map(type => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={getTypeButtonClass(type)}
              aria-pressed={selectedType === type}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 검색 입력창 */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="공장명, 주소, 담당자, 연락처, 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              aria-label="공장 검색"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default FactoryToolbar;