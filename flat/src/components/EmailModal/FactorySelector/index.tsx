import React from 'react';
import { Search, X, Building2 } from 'lucide-react';
import type { Factory } from '@/data/factories';
import './FactorySelector.css';
import { FactoryId, extractIdString } from '@/components/types/branded';

interface FactorySelectorProps {
  availableFactories?: Factory[];
  selectedFactories: FactoryId[]; // Factory IDs
  setSelectedFactories: (factories: FactoryId[]) => void;
  defaultRecipients?: string;
}

const FactorySelector: React.FC<FactorySelectorProps> = ({
  availableFactories,
  selectedFactories,
  setSelectedFactories,
  defaultRecipients
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleFactoryToggle = (factoryId: FactoryId, checked: boolean) => {
    if (checked) {
      setSelectedFactories([...selectedFactories, factoryId]);
    } else {
      setSelectedFactories(selectedFactories.filter(f => f !== factoryId));
    }
  };

  const handleFactoryAdd = (factoryId: FactoryId) => {
    if (!selectedFactories.includes(factoryId)) {
      setSelectedFactories([...selectedFactories, factoryId]);
    }
    setSearchQuery('');
  };

  const handleFactoryRemove = (factoryId: FactoryId) => {
    setSelectedFactories(selectedFactories.filter(f => f !== factoryId));
  };

  // 프로젝트가 선택된 경우
  if (defaultRecipients && defaultRecipients.length > 0 && availableFactories && availableFactories.length > 0) {
    return (
      <div className="modal-field-spacing">
        <div className="modal-field-label">
          <Building2 />
          받는 공장
        </div>
        <div>
          <p className="factory-selector__description">선택된 프로젝트의 공장들</p>
          <div className="factory-selector__list">
            {availableFactories.map((factory) => (
              <label key={factory.id} className="factory-selector__checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedFactories.includes(factory.id)}
                  onChange={(e) => handleFactoryToggle(factory.id, e.target.checked)}
                />
                <div className="factory-selector__dot" style={{ '--factory-color': `var(--color-factory-${factory.type.toLowerCase()})` } as React.CSSProperties}></div>
                <span className="factory-selector__name">{factory.name}</span>
                <span className="factory-selector__type">{factory.type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 프로젝트가 선택되지 않은 경우 - 검색으로만 추가
  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Building2 />
        받는 공장
      </div>
      <div>
        <div className="factory-selector__search-wrapper">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="공장을 검색하세요"
            className="modal-input pr-8"
          />
          <Search className="factory-selector__search-icon" />
        </div>
        {searchQuery.length > 0 && (
          <div className="factory-selector__list">
            {availableFactories && availableFactories.length > 0 && availableFactories
              .filter(factory => factory.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((factory) => (
              <button
                key={factory.id}
                onClick={() => handleFactoryAdd(factory.id)}
                className="factory-selector__item"
              >
                <div className="factory-selector__dot" style={{ '--factory-color': `var(--color-factory-${factory.type.toLowerCase()})` } as React.CSSProperties}></div>
                <span className="factory-selector__name">{factory.name}</span>
                <span className="factory-selector__type">{factory.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* 선택된 공장 표시 */}
      {selectedFactories.length > 0 && (
        <div className="factory-selector__selected">
          <p className="factory-selector__selected-count">{selectedFactories.length}개 공장 선택됨</p>
          <div className="factory-selector__selected-list">
            {selectedFactories.map((factoryId) => {
              const factory = availableFactories?.find(f => f.id === factoryId);
              return (
                <div key={factoryId} className="factory-selector__tag">
                  {factory && <div className="factory-selector__tag-dot" style={{ '--factory-color': `var(--color-factory-${factory.type.toLowerCase()})` } as React.CSSProperties}></div>}
                  <span>{factory?.name || factoryId}</span>
                  <button
                    onClick={() => handleFactoryRemove(factoryId)}
                    className="factory-selector__tag-remove"
                  >
                    <X />
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