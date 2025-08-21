import React from 'react';
import type { ProjectData } from './types';
import FactorySelector from './components/FactorySelector';

interface FactorySectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const FactorySection: React.FC<FactorySectionProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">공장 정보</h3>
      
      {/* Factory Selector */}
      <FactorySelector onChange={onChange} />
    </div>
  );
};

export default FactorySection;