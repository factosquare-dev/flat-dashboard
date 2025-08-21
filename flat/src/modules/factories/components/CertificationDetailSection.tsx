import React, { useState } from 'react';
import { Plus, X, Award } from 'lucide-react';
import type { CertificationDetail, CertificationFormData } from '@/shared/types/certification';
import type { CertificationType } from '@/core/database/factories';
import { Button } from '@/shared/components/ui/Button';
import { ButtonVariant, ButtonSize } from '@/shared/types/enums';

interface CertificationDetailSectionProps {
  certifications: CertificationDetail[];
  availableCertifications: CertificationType[];
  onAddCertification: (cert: CertificationDetail) => void;
  onRemoveCertification: (id: string) => void;
}

const CertificationDetailSection: React.FC<CertificationDetailSectionProps> = ({
  certifications,
  availableCertifications,
  onAddCertification,
  onRemoveCertification,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CertificationFormData>({
    type: '',
    certNumber: '',
    issueDate: '',
    expiryDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (formData.type && formData.certNumber) {
      const newCert: CertificationDetail = {
        id: Date.now().toString(),
        type: formData.type as CertificationType,
        certNumber: formData.certNumber,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
      };
      
      onAddCertification(newCert);
      
      // Reset form
      setFormData({
        type: '',
        certNumber: '',
        issueDate: '',
        expiryDate: '',
      });
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: '',
      certNumber: '',
      issueDate: '',
      expiryDate: '',
    });
    setShowForm(false);
  };

  return (
    <div className="modal-field-spacing">
      <div className="flex items-center justify-between mb-3">
        <label className="modal-field-label flex items-center gap-2">
          <Award className="w-4 h-4" />
          인증서 정보
        </label>
        {!showForm && (
          <Button
            variant={ButtonVariant.GHOST}
            size={ButtonSize.SM}
            onClick={() => setShowForm(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            인증서 추가
          </Button>
        )}
      </div>

      {/* 인증서 목록 */}
      {certifications.length > 0 && (
        <div className="space-y-2 mb-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="certification-item">
              <div className="flex-1">
                <div className="font-medium text-sm">{cert.type}</div>
                <div className="text-xs text-gray-600">
                  인증번호: {cert.certNumber}
                  {cert.issueDate && ` | 발급일: ${cert.issueDate}`}
                  {cert.expiryDate && ` | 만료일: ${cert.expiryDate}`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveCertification(cert.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 인증서 추가 폼 */}
      {showForm && (
        <div className="certification-form">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700">인증서 유형 *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="modal-input text-sm"
              >
                <option value="">선택하세요</option>
                {availableCertifications.map((cert) => (
                  <option key={cert} value={cert}>{cert}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700">인증번호 *</label>
              <input
                type="text"
                name="certNumber"
                value={formData.certNumber}
                onChange={handleInputChange}
                placeholder="인증번호 입력"
                className="modal-input text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700">발급일</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                className="modal-input text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700">유효기간</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="modal-input text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SM}
              onClick={handleCancel}
            >
              취소
            </Button>
            <Button
              variant={ButtonVariant.PRIMARY}
              size={ButtonSize.SM}
              onClick={handleAdd}
              disabled={!formData.type || !formData.certNumber}
            >
              추가
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationDetailSection;