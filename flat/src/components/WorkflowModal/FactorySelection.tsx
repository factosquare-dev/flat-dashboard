import React from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import { getLightColorClass, getDotColorClass } from './utils';

interface FactorySelectionProps {
  factories: Array<{
    name: string;
    color: string;
  }>;
  selectedFactory: string;
  onFactorySelect: (factoryName: string) => void;
}

export const FactorySelection: React.FC<FactorySelectionProps> = ({
  factories,
  selectedFactory,
  onFactorySelect
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        공장 선택
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {factories.map((factory) => (
          <button
            key={factory.name}
            onClick={() => onFactorySelect(factory.name)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedFactory === factory.name 
                ? getLightColorClass(factory.color)
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getDotColorClass(factory.color)}`}></div>
              <span className="text-sm font-medium text-gray-800">{factory.name}</span>
              {selectedFactory === factory.name && (
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};