import React from 'react';
import { Search, X } from 'lucide-react';

interface Factory {
  name: string;
  color: string;
  type: string;
}

interface FactorySelectorProps {
  availableFactories?: Factory[];
  selectedFactories: string[];
  setSelectedFactories: (factories: string[]) => void;
  defaultRecipients?: string;
}

const FactorySelector: React.FC<FactorySelectorProps> = ({
  availableFactories,
  selectedFactories,
  setSelectedFactories,
  defaultRecipients
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleFactoryToggle = (factoryName: string, checked: boolean) => {
    if (checked) {
      setSelectedFactories([...selectedFactories, factoryName]);
    } else {
      setSelectedFactories(selectedFactories.filter(f => f !== factoryName));
    }
  };

  const handleFactoryAdd = (factoryName: string) => {
    if (!selectedFactories.includes(factoryName)) {
      setSelectedFactories([...selectedFactories, factoryName]);
    }
    setSearchQuery('');
  };

  const handleFactoryRemove = (factoryName: string) => {
    setSelectedFactories(selectedFactories.filter(f => f !== factoryName));
  };

  // 프로젝트가 선택된 경우
  if (defaultRecipients && defaultRecipients.length > 0 && availableFactories && availableFactories.length > 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          받는 공장
        </label>
        <div>
          <p className="text-sm text-gray-500 mb-2">선택된 프로젝트의 공장들</p>
          <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {availableFactories.map((factory) => (
              <label key={factory.name} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFactories.includes(factory.name)}
                  onChange={(e) => handleFactoryToggle(factory.name, e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className={`w-3 h-3 rounded-full ${factory.color} mr-2`}></div>
                <span className="text-sm">{factory.name}</span>
                <span className="ml-auto text-xs text-gray-500">{factory.type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 프로젝트가 선택되지 않은 경우 - 검색으로만 추가
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        받는 공장
      </label>
      <div>
        <div className="relative mb-3">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="공장을 검색하세요"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        {searchQuery.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {availableFactories && availableFactories.length > 0 && availableFactories
              .filter(factory => factory.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((factory) => (
              <button
                key={factory.name}
                onClick={() => handleFactoryAdd(factory.name)}
                className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <div className={`w-3 h-3 rounded-full ${factory.color} mr-2`}></div>
                <span className="text-sm">{factory.name}</span>
                <span className="ml-auto text-xs text-gray-500">{factory.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* 선택된 공장 표시 */}
      {selectedFactories.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">{selectedFactories.length}개 공장 선택됨</p>
          <div className="flex flex-wrap gap-2">
            {selectedFactories.map((factoryName) => {
              const factory = availableFactories?.find(f => f.name === factoryName);
              return (
                <div key={factoryName} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {factory && <div className={`w-2 h-2 rounded-full ${factory.color}`}></div>}
                  <span>{factoryName}</span>
                  <button
                    onClick={() => handleFactoryRemove(factoryName)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FactorySelector;