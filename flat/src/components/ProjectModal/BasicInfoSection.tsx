import React from 'react';
import { Users } from 'lucide-react';
import type { ProjectData } from './types';

interface BasicInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Users />
        기본 정보
      </div>
      <div className="modal-grid-2">
        <div className="modal-field-spacing">
          <label className="modal-field-label">고객명 *</label>
          <input
            type="text"
            className="modal-input"
            value={formData.client}
            onChange={(e) => onChange({ client: e.target.value })}
            placeholder="고객명을 입력하세요"
            required
          />
        </div>
        <div className="modal-field-spacing">
          <label className="modal-field-label">담당자 *</label>
          <input
            type="text"
            className="modal-input"
            value={formData.manager}
            onChange={(e) => onChange({ manager: e.target.value })}
            placeholder="담당자명을 입력하세요"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;