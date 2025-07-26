import React from 'react';
import { Building2 } from 'lucide-react';
import type { ProjectData } from './types';

interface FactoryInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const FactoryInfoSection: React.FC<FactoryInfoSectionProps> = ({ formData, onChange }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Building2 />
        공장 정보
      </div>
      <div className="modal-grid-3">
        <div className="modal-field-spacing">
          <label className="modal-field-label">제조</label>
          <input
            type="text"
            value={formData.manufacturer}
            onChange={(e) => onChange({ manufacturer: e.target.value })}
            onKeyPress={handleKeyPress}
            className="modal-input"
            placeholder="제조 공장"
          />
        </div>
        <div className="modal-field-spacing">
          <label className="modal-field-label">용기</label>
          <input
            type="text"
            value={formData.container}
            onChange={(e) => onChange({ container: e.target.value })}
            onKeyPress={handleKeyPress}
            className="modal-input"
            placeholder="용기 공장"
          />
        </div>
        <div className="modal-field-spacing">
          <label className="modal-field-label">포장</label>
          <input
            type="text"
            value={formData.packaging}
            onChange={(e) => onChange({ packaging: e.target.value })}
            onKeyPress={handleKeyPress}
            className="modal-input"
            placeholder="포장 공장"
          />
        </div>
      </div>
    </div>
  );
};

export default FactoryInfoSection;