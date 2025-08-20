import React from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import type { Factory } from '@/core/database/factories';

interface FactorySelectionProps {
  factories: Factory[];
  selectedFactory: string; // Factory ID
  onFactorySelect: (factoryId: string) => void;
}

export const FactorySelection: React.FC<FactorySelectionProps> = ({
  factories,
  selectedFactory,
  onFactorySelect
}) => {
  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Building2 />
        공장 선택
      </div>
      <div className="modal-grid-2">
        {factories.map((factory) => (
          <button
            key={factory.id}
            onClick={() => onFactorySelect(factory.id)}
            className={`modal-button-compact ${selectedFactory === factory.id ? 'selected' : ''}`}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: `var(--color-factory-${factory.type.toLowerCase()})`}}></div>
              <span className="font-medium text-gray-800">{factory.name}</span>
              {selectedFactory === factory.id && (
                <ChevronRight className="w-3 h-3 text-gray-400 ml-auto" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};