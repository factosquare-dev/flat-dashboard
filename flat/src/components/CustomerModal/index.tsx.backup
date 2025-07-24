import React, { useState, useEffect } from 'react';
import { X, Save, Building2, User, Phone, Mail, MapPin, Hash } from 'lucide-react';
import BaseModal, { ModalFooter } from '../common/BaseModal';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import { Button } from '../ui/Button';
import type { Customer } from '@/types/customer';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
  editData?: Customer | null;
  mode?: 'create' | 'edit' | 'view';
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    address: '',
    businessNumber: '',
    industry: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        companyName: editData.companyName || '',
        contactPerson: editData.contactPerson || '',
        contactNumber: editData.contactNumber || '',
        email: editData.email || '',
        address: editData.address || '',
        businessNumber: editData.businessNumber || '',
        industry: editData.industry || '',
        notes: editData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        companyName: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        address: '',
        businessNumber: '',
        industry: '',
        notes: ''
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '고객명은 필수입니다';
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = '담당자명은 필수입니다';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = '연락처는 필수입니다';
    }
    if (!formData.email.trim()) {
      newErrors.email = '이메일은 필수입니다';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        companyName: formData.companyName || formData.name // 회사명이 없으면 고객명 사용
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isViewMode = mode === 'view';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'create' ? '고객 등록' :
        mode === 'edit' ? '고객 정보 수정' :
        '고객 정보'
      }
      size="md"
    >
      <div className="space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            기본 정보
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="고객명"
              value={formData.name}
              onChange={(value) => handleChange('name', value)}
              placeholder="고객명을 입력하세요"
              required
              disabled={isViewMode}
              error={errors.name}
            />
            <FormInput
              label="회사명"
              value={formData.companyName}
              onChange={(value) => handleChange('companyName', value)}
              placeholder="회사명을 입력하세요"
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* 담당자 정보 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4" />
            담당자 정보
          </h3>
          <div className="space-y-4">
            <FormInput
              label="담당자명"
              value={formData.contactPerson}
              onChange={(value) => handleChange('contactPerson', value)}
              placeholder="담당자명을 입력하세요"
              required
              disabled={isViewMode}
              error={errors.contactPerson}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="연락처"
                value={formData.contactNumber}
                onChange={(value) => handleChange('contactNumber', value)}
                placeholder="010-0000-0000"
                icon={<Phone className="w-4 h-4" />}
                required
                disabled={isViewMode}
                error={errors.contactNumber}
              />
              <FormInput
                label="이메일"
                value={formData.email}
                onChange={(value) => handleChange('email', value)}
                placeholder="example@company.com"
                icon={<Mail className="w-4 h-4" />}
                required
                disabled={isViewMode}
                error={errors.email}
              />
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">추가 정보</h3>
          <FormInput
            label="주소"
            value={formData.address}
            onChange={(value) => handleChange('address', value)}
            placeholder="주소를 입력하세요"
            icon={<MapPin className="w-4 h-4" />}
            disabled={isViewMode}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="사업자번호"
              value={formData.businessNumber}
              onChange={(value) => handleChange('businessNumber', value)}
              placeholder="000-00-00000"
              icon={<Hash className="w-4 h-4" />}
              disabled={isViewMode}
            />
            <FormInput
              label="업종"
              value={formData.industry}
              onChange={(value) => handleChange('industry', value)}
              placeholder="예: 화장품, 의료기기"
              disabled={isViewMode}
            />
          </div>
          <FormTextarea
            label="비고"
            value={formData.notes}
            onChange={(value) => handleChange('notes', value)}
            placeholder="추가 정보를 입력하세요"
            rows={3}
            disabled={isViewMode}
          />
        </div>
      </div>

      {!isViewMode && (
        <ModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {mode === 'create' ? '등록' : '수정'}
          </Button>
        </ModalFooter>
      )}
    </BaseModal>
  );
};

export default CustomerModal;