import React, { useState, useEffect } from 'react';
import { Building2, X } from 'lucide-react';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

interface FactorySelectorProps {
  onChange: (updates: any) => void;
}

interface SelectedFactories {
  manufacturing?: any;
  container?: any;
  packaging?: any;
}

type FactoryType = keyof SelectedFactories;

const FactorySelector: React.FC<FactorySelectorProps> = ({ onChange }) => {
  const [factories, setFactories] = useState<any[]>([]);
  const [selectedFactories, setSelectedFactories] = useState<SelectedFactories>({});
  const [showFactorySearch, setShowFactorySearch] = useState<FactoryType | null>(null);
  const dropdownRefs = React.useRef<{ [key in FactoryType]?: HTMLDivElement }>({});

  const db = MockDatabaseImpl.getInstance();

  const factoryTypeLabels: Record<FactoryType, string> = {
    manufacturing: '제조 공장',
    container: '용기 공장',
    packaging: '포장 공장'
  };

  useEffect(() => {
    // Load factories from DB
    const factoriesResult = db.getAll('factories');
    if (factoriesResult.success && factoriesResult.data) {
      setFactories(factoriesResult.data);
    }
  }, []);

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFactorySearch) {
        const currentRef = dropdownRefs.current[showFactorySearch];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setShowFactorySearch(null);
        }
      }
    };

    if (showFactorySearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFactorySearch]);

  const selectFactory = (type: FactoryType, factory: any) => {
    const updated = {
      ...selectedFactories,
      [type]: factory
    };
    setSelectedFactories(updated);

    // Update form data
    onChange({
      [`${type}FactoryId`]: factory.id,
      [`${type}FactoryName`]: factory.name
    });

    setShowFactorySearch(null);
  };

  const removeFactory = (type: FactoryType) => {
    const updated = { ...selectedFactories };
    delete updated[type];
    setSelectedFactories(updated);

    // Update form data
    onChange({
      [`${type}FactoryId`]: undefined,
      [`${type}FactoryName`]: undefined
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {(Object.keys(factoryTypeLabels) as FactoryType[]).map(type => (
        <div key={type} className="space-y-2" ref={(el) => { if (el) dropdownRefs.current[type] = el; }}>
          <label className="block text-xs font-medium text-gray-700">
            {factoryTypeLabels[type]}
          </label>

          <div className="relative">
            {selectedFactories[type] ? (
              <div className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded-md">
                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedFactories[type].name}
                  </div>
                  {selectedFactories[type].location && (
                    <div className="text-xs text-gray-500">
                      {selectedFactories[type].location}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFactory(type)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowFactorySearch(showFactorySearch === type ? null : type)}
                className="w-full p-3 bg-gray-50 border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">공장 추가</span>
                </div>
              </button>
            )}

            {/* Factory Dropdown */}
            {showFactorySearch === type && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="py-1" onClick={(e) => e.stopPropagation()}>
                  {factories.length > 0 ? (
                    factories.map(factory => (
                      <button
                        key={factory.id}
                        type="button"
                        onClick={() => selectFactory(type, factory)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {factory.name}
                            </div>
                            {factory.location && (
                              <div className="text-xs text-gray-500">
                                {factory.location}
                              </div>
                            )}
                            {factory.capacity && (
                              <div className="text-xs text-gray-400">
                                생산능력: {factory.capacity}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      등록된 공장이 없습니다
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FactorySelector;