import React from 'react';
import { X } from 'lucide-react';
import type { CertificationType } from '../../data/factories';
import { useFactoryForm, type FactoryFormData } from './hooks/useFactoryForm';
import FormField from './components/FormField';
import ManagerSection from './components/ManagerSection';
import CertificationSection from './components/CertificationSection';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">
            {editData ? '공장 수정' : '공장 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
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

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FactoryModal;