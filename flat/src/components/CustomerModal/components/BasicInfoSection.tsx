import React from 'react';
import { Building2 } from 'lucide-react';
import { APP_CONSTANTS } from '../../../config/constants';

interface BasicInfoSectionProps {
  name: string;
  companyName: string;
  errors: Record<string, string>;
  isViewMode: boolean;
  onChange: (field: string, value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name,
  companyName,
  errors,
  isViewMode,
  onChange
}) => {
  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Building2 />
        기본 정보
      </div>
      <div className="modal-grid-2">
        <div className="modal-field-spacing">
          <label className="modal-field-label">{APP_CONSTANTS.TEXT.CUSTOMER.NAME} *</label>
          <input
            type="text"
            className={`modal-input ${errors.name ? 'border-red-400' : ''}`}
            value={name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={`${APP_CONSTANTS.TEXT.CUSTOMER.NAME}을 입력하세요`}
            required
            disabled={isViewMode}
          />
          {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
        </div>
        <div className="modal-field-spacing">
          <label className="modal-field-label">{APP_CONSTANTS.TEXT.CUSTOMER.COMPANY}</label>
          <input
            type="text"
            className="modal-input"
            value={companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            placeholder={`${APP_CONSTANTS.TEXT.CUSTOMER.COMPANY}을 입력하세요`}
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;