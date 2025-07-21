import React from 'react';
import type { CertificationType } from '../../data/factories';
import { useFactoryForm, type FactoryFormData } from './hooks/useFactoryForm';
import FormField from './components/FormField';
import ManagerSection from './components/ManagerSection';
import CertificationSection from './components/CertificationSection';
import BaseModal, { ModalFooter } from '../common/BaseModal';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? '공장 수정' : '공장 등록'}
      description="공장 정보를 입력해주세요"
      size="xl"
      footer={
        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            form="factory-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
          >
            {editData ? '수정' : '등록'}
          </button>
        </ModalFooter>
      }
    >
      <form id="factory-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* 왼쪽 컬럼 */}
            <div className="space-y-4">
              <FormField
                label="공장명"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <FormField
                label="공장 유형"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="제조">제조</option>
                <option value="용기">용기</option>
                <option value="포장">포장</option>
              </FormField>

              <FormField
                label="사업장 주소"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="사업장 주소"
              />

              <FormField
                label="사업자번호"
                placeholder="000-00-00000"
              />

              <FormField
                label="사업장 전화번호"
                name="contact"
                type="tel"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="02-0000-0000"
              />

              <ManagerSection
                managers={formData.managers}
                showManagerForm={showManagerForm}
                newManager={newManager}
                onShowManagerForm={setShowManagerForm}
                onManagerInputChange={handleManagerInputChange}
                onAddManager={handleAddManager}
                onRemoveManager={handleRemoveManager}
              />

              <FormField
                label="담당자 이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />

              <FormField
                label="제품"
                placeholder="생산 가능 제품"
              />

              <CertificationSection
                certifications={formData.certifications}
                availableCertifications={availableCertifications}
                onCertificationToggle={handleCertificationToggle}
              />
            </div>

            {/* 오른쪽 컬럼 - 인증 정보 */}
            <div className="space-y-4">
              <FormField
                label="생산 가능 수량"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="예: 10,000개/월"
              />

              <FormField
                label="인증서 유형"
                placeholder="예: ISO 22716"
              />

              <FormField
                label="인증 번호"
                placeholder="인증번호 입력"
              />

              <FormField
                label="발급일"
                type="date"
              />

              <FormField
                label="유효기간"
                type="date"
              />
            </div>
          </div>
        </form>
    </BaseModal>
  );
};

export default FactoryModal;