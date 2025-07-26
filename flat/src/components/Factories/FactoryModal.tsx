import React from 'react';
import type { CertificationType } from '../../data/factories';
import { useFactoryForm, type FactoryFormData } from './hooks/useFactoryForm';
import ManagerSection from './components/ManagerSection';
import CertificationSection from './components/CertificationSection';
import BaseModal, { ModalFooter } from '../common/BaseModal';
import { useModalFormValidation } from '../../hooks/useModalFormValidation';
import { AlertCircle } from 'lucide-react';
import { FactoryType, FactoryTypeLabel, ModalSize, ButtonVariant } from '../../types/enums';
import { MODAL_SIZES } from '../../utils/modalUtils';
import Button from '../common/Button';
import './FactoryModal.css';

interface FactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (factoryData: FactoryFormData) => void;
  editData?: FactoryFormData | null;
}

export type { FactoryFormData };

const FactoryModal: React.FC<FactoryModalProps> = ({ isOpen, onClose, onSave, editData }) => {
  const {
    formData,
    showManagerForm,
    newManager,
    setShowManagerForm,
    handleInputChange,
    handleCertificationToggle,
    handleManagerInputChange,
    handleAddManager,
    handleRemoveManager
  } = useFactoryForm(editData, isOpen);

  const availableCertifications: CertificationType[] = [
    'ISO 22716', 'CGMP', 'ISO 9001', 'ISO 14001', 'ISO 45001',
    'FSC', 'VEGAN', 'HALAL', 'EWG', 'COSMOS', 'ECOCERT'
  ];

  // Validation rules
  const validationRules = {
    name: { required: true },
    type: { required: true },
    address: { required: true },
    contact: { 
      required: true,
      pattern: /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/,
      custom: (value: string) => {
        if (value && !value.match(/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/)) {
          return '전화번호 형식이 올바르지 않습니다 (예: 02-1234-5678)';
        }
        return null;
      }
    },
    email: {
      required: true,
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      custom: (value: string) => {
        if (value && !value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
          return '올바른 이메일 형식이 아닙니다';
        }
        return null;
      }
    }
  };

  const {
    errors,
    touched,
    formRef,
    handleSubmit: handleFormSubmit,
    getFieldProps,
    validateForm
  } = useModalFormValidation(formData, {
    rules: validationRules,
    onSubmit: (data) => {
      onSave(data);
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    handleFormSubmit(e);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? '공장 수정' : '공장 등록'}
      description="공장 정보를 입력해주세요"
      size={MODAL_SIZES.EXTRA_LARGE}
      footer={
        <ModalFooter>
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant={ButtonVariant.PRIMARY}
            type="submit"
            form="factory-form"
          >
            {editData ? '수정' : '등록'}
          </Button>
        </ModalFooter>
      }
    >
      <form ref={formRef} id="factory-form" onSubmit={handleSubmit}>
          {/* Show validation error if there are any */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="factory-modal__error">
              <AlertCircle className="factory-modal__error-icon" />
              <span>필수 입력 항목을 모두 입력해주세요</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-6">
            {/* 왼쪽 컬럼 */}
            <div className="modal-section-spacing">
              <div className="modal-field-spacing">
                <label className="modal-field-label">공장명 *</label>
                <input
                  type="text"
                  name="name"
                  className={`modal-input ${errors.name && touched.name ? 'border-red-400' : ''}`}
                  value={formData.name}
                  onChange={(e) => {
                    handleInputChange(e);
                    getFieldProps('name').onChange(e);
                  }}
                  onBlur={getFieldProps('name').onBlur}
                  placeholder="공장명을 입력하세요"
                />
                {errors.name && touched.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
              </div>

              <div className="modal-field-spacing">
                <label className="modal-field-label">공장 유형 *</label>
                <select
                  name="type"
                  className={`modal-input ${errors.type && touched.type ? 'border-red-400' : ''}`}
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  {Object.entries(FactoryTypeLabel).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {errors.type && touched.type && <div className="text-red-600 text-xs mt-1">{errors.type}</div>}
              </div>

              <div className="modal-field-spacing">
                <label className="modal-field-label">사업장 주소 *</label>
                <input
                  type="text"
                  name="address"
                  className={`modal-input ${errors.address && touched.address ? 'border-red-400' : ''}`}
                  value={formData.address}
                  onChange={(e) => {
                    handleInputChange(e);
                    getFieldProps('address').onChange(e);
                  }}
                  onBlur={getFieldProps('address').onBlur}
                  placeholder="사업장 주소"
                />
                {errors.address && touched.address && <div className="text-red-600 text-xs mt-1">{errors.address}</div>}
              </div>

              <div className="modal-field-spacing">
                <label className="modal-field-label">사업자번호</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="000-00-00000"
                />
              </div>

              <div className="modal-field-spacing">
                <label className="modal-field-label">사업장 전화번호 *</label>
                <input
                  type="tel"
                  name="contact"
                  className={`modal-input ${errors.contact && touched.contact ? 'border-red-400' : ''}`}
                  value={formData.contact}
                  onChange={(e) => {
                    handleInputChange(e);
                    getFieldProps('contact').onChange(e);
                  }}
                  onBlur={getFieldProps('contact').onBlur}
                  placeholder="02-0000-0000"
                />
                {errors.contact && touched.contact && <div className="text-red-600 text-xs mt-1">{errors.contact}</div>}
              </div>

              <ManagerSection
                managers={formData.managers}
                showManagerForm={showManagerForm}
                newManager={newManager}
                onShowManagerForm={setShowManagerForm}
                onManagerInputChange={handleManagerInputChange}
                onAddManager={handleAddManager}
                onRemoveManager={handleRemoveManager}
              />

              <div className="modal-field-spacing">
                <label className="modal-field-label">담당자 이메일 *</label>
                <input
                  type="email"
                  name="email"
                  className={`modal-input ${errors.email && touched.email ? 'border-red-400' : ''}`}
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange(e);
                    getFieldProps('email').onChange(e);
                  }}
                  onBlur={getFieldProps('email').onBlur}
                  placeholder="example@company.com"
                />
                {errors.email && touched.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
              </div>

              <div className="modal-field-spacing">
                <label className="modal-field-label">제품</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="생산 가능 제품"
                />
              </div>

              <CertificationSection
                certifications={formData.certifications}
                availableCertifications={availableCertifications}
                onCertificationToggle={handleCertificationToggle}
              />
            </div>

            {/* 오른쪽 컬럼 - 인증 정보 */}
            <div className="modal-section-spacing">
              <div className="modal-field-spacing">
                <label className="modal-field-label">생산 가능 수량</label>
                <input
                  type="text"
                  name="capacity"
                  className="modal-input"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="예: 10,000개/월"
                />
              </div>

              <div className="modal-field-spacing">
                <label className="modal-field-label">인증서 유형</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="예: ISO 22716"
                />
              </div>

              <div className="modal-field-spacing">
                <label className="modal-field-label">인증 번호</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="인증번호 입력"
                />
              </div>

              <div className="modal-field-spacing">
                <label className="modal-field-label">발급일</label>
                <input
                  type="date"
                  className="modal-input"
                />
              </div>

              <div className="modal-field-spacing">
                <label className="modal-field-label">유효기간</label>
                <input
                  type="date"
                  className="modal-input"
                />
              </div>
            </div>
          </div>
        </form>
    </BaseModal>
  );
};

export default FactoryModal;