import React from 'react';
import { User, Phone, Mail } from 'lucide-react';

interface ContactInfoSectionProps {
  contactPerson: string;
  contactNumber: string;
  email: string;
  errors: Record<string, string>;
  isViewMode: boolean;
  onChange: (field: string, value: string) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  contactPerson,
  contactNumber,
  email,
  errors,
  isViewMode,
  onChange
}) => {
  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <User />
        담당자 정보
      </div>
      <div className="modal-section-spacing">
        <div className="modal-field-spacing">
          <label className="modal-field-label">담당자명 *</label>
          <input
            type="text"
            className={`modal-input ${errors.contactPerson ? 'border-red-400' : ''}`}
            value={contactPerson}
            onChange={(e) => onChange('contactPerson', e.target.value)}
            placeholder="담당자명을 입력하세요"
            required
            disabled={isViewMode}
          />
          {errors.contactPerson && <div className="text-red-600 text-xs mt-1">{errors.contactPerson}</div>}
        </div>
        <div className="modal-grid-2">
          <div className="modal-field-spacing">
            <label className="modal-field-label">
              <Phone />
              연락처 *
            </label>
            <input
              type="text"
              className={`modal-input ${errors.contactNumber ? 'border-red-400' : ''}`}
              value={contactNumber}
              onChange={(e) => onChange('contactNumber', e.target.value)}
              placeholder="010-0000-0000"
              required
              disabled={isViewMode}
            />
            {errors.contactNumber && <div className="text-red-600 text-xs mt-1">{errors.contactNumber}</div>}
          </div>
          <div className="modal-field-spacing">
            <label className="modal-field-label">
              <Mail />
              이메일 *
            </label>
            <input
              type="email"
              className={`modal-input ${errors.email ? 'border-red-400' : ''}`}
              value={email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="example@company.com"
              required
              disabled={isViewMode}
            />
            {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;