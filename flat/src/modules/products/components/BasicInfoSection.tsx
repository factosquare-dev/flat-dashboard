import React from 'react';
import '../styles/form-styles.css';

interface BasicInfoSectionProps {
  data: {
    createdDate?: string;
    sampleRequestDate?: string;
    companyName?: string;
    contactPerson?: string;
    contactNumber?: string;
    emailAddress?: string;
    sampleDeliveryAddress?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ data, onChange }) => {
  return (
    <div className="form-section">
      <h3 className="form-section-title">기본 정보</h3>
      
      <div className="form-grid-2">
        <div>
          <label htmlFor="createdDate" className="form-label">작성일</label>
          <input
            id="createdDate"
            type="date"
            value={data.createdDate || ''}
            onChange={(e) => onChange('createdDate', e.target.value)}
            className="form-input"
          />
        </div>
        
        <div>
          <label htmlFor="sampleRequestDate" className="form-label">샘플 요청일</label>
          <input
            id="sampleRequestDate"
            type="date"
            value={data.sampleRequestDate || ''}
            onChange={(e) => onChange('sampleRequestDate', e.target.value)}
            className="form-input"
          />
        </div>
        
        <div>
          <label htmlFor="companyName" className="form-label">업체명</label>
          <input
            id="companyName"
            value={data.companyName || ''}
            onChange={(e) => onChange('companyName', e.target.value)}
            placeholder="업체명을 입력하세요"
            className="form-input"
          />
        </div>
        
        <div>
          <label htmlFor="contactPerson" className="form-label">담당자 성함</label>
          <input
            id="contactPerson"
            value={data.contactPerson || ''}
            onChange={(e) => onChange('contactPerson', e.target.value)}
            placeholder="담당자 성함을 입력하세요"
            className="form-input"
          />
        </div>
        
        <div>
          <label htmlFor="contactNumber" className="form-label">연락처</label>
          <input
            id="contactNumber"
            type="tel"
            value={data.contactNumber || ''}
            onChange={(e) => onChange('contactNumber', e.target.value)}
            placeholder="연락처를 입력하세요"
            className="form-input"
          />
        </div>
        
        <div>
          <label htmlFor="emailAddress" className="form-label">이메일 주소</label>
          <input
            id="emailAddress"
            type="email"
            value={data.emailAddress || ''}
            onChange={(e) => onChange('emailAddress', e.target.value)}
            placeholder="이메일 주소를 입력하세요"
            className="form-input"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <label htmlFor="sampleDeliveryAddress" className="form-label">샘플수령주소</label>
        <input
          id="sampleDeliveryAddress"
          value={data.sampleDeliveryAddress || ''}
          onChange={(e) => onChange('sampleDeliveryAddress', e.target.value)}
          placeholder="샘플 수령 주소를 입력하세요"
          className="form-input"
        />
      </div>
    </div>
  );
};