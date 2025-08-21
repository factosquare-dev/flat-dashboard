import React, { useState, useEffect } from 'react';
import BaseModal, { ModalFooter } from '@/shared/components/BaseModal';
import { FormFields } from './FormFields';
import type { UserModalProps, UserFormData, FormErrors } from './types';
import type { UserRole } from '@/store/slices/userSlice';
import { UserRole as UserRoleEnum } from '@/shared/types/enums';
import { 
  formatPhoneNumber, 
  validateForm, 
  getDefaultDepartment, 
  getDefaultPosition 
} from './utils';
import { useModalFormValidation } from '@/shared/hooks/useModalFormValidation';
import { AlertCircle } from 'lucide-react';
import { MODAL_SIZES } from '@/shared/utils/modalUtils';
import { ButtonVariant } from '@/shared/types/enums';
import { Button } from '@/shared/components/Button';

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: UserRoleEnum.CUSTOMER,
    department: '',
    position: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData);
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: UserRoleEnum.CUSTOMER,
          department: '',
          position: ''
        });
      }
      // Reset validation state
      resetForm();
    }
  }, [editData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Field change handled by validation hook
    handleFieldChange(name as keyof UserFormData, value);

    // role 변경 시 기본값 설정
    if (name === 'role') {
      if (value === UserRoleEnum.ADMIN || value === UserRoleEnum.MANAGER) {
        setFormData(prev => ({
          ...prev,
          department: prev.department || getDefaultDepartment(value as UserRole),
          position: prev.position || getDefaultPosition(value as UserRole)
        }));
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    handleFieldChange('phone', formatted);
  };

  // Validation rules
  const validationRules = {
    name: { required: true },
    email: { 
      required: true,
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      custom: (value: string) => {
        if (value && !value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
          return '올바른 이메일 형식이 아닙니다';
        }
        return null;
      }
    },
    phone: { 
      required: true,
      pattern: /^\d{3}-\d{3,4}-\d{4}$/,
      custom: (value: string) => {
        if (value && !value.match(/^\d{3}-\d{3,4}-\d{4}$/)) {
          return '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)';
        }
        return null;
      }
    },
    department: { 
      required: formData.role === UserRoleEnum.CUSTOMER,
      custom: (value: string) => {
        if (formData.role === UserRoleEnum.CUSTOMER && !value?.trim()) {
          return '고객의 경우 회사명은 필수입니다';
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
    handleFieldChange,
    resetForm,
    isSubmitting
  } = useModalFormValidation(formData, {
    rules: validationRules,
    onSubmit: async (data) => {
      await onSave(data);
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
      title={editData ? '사용자 수정' : '사용자 등록'}
      description="사용자 정보를 입력해주세요"
      size={MODAL_SIZES.MEDIUM}
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
            form="user-form"
          >
            {editData ? '수정' : '등록'}
          </Button>
        </ModalFooter>
      }
    >
      <form ref={formRef} id="user-form" onSubmit={handleSubmit}>
        {/* Validation error message */}
        {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>필수 입력 항목을 모두 입력해주세요</span>
          </div>
        )}
        
        <FormFields
          formData={formData}
          errors={errors}
          onChange={handleInputChange}
          onPhoneChange={handlePhoneChange}
        />
        
        {/* 수정 모드가 아닐 때 비밀번호 섹션 표시 */}
        {!editData && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mt-4">
            <p className="text-blue-700 text-xs mb-1">
              * 초기 비밀번호는 이메일 주소와 동일하게 설정됩니다.
            </p>
            <p className="text-blue-700 text-xs">
              * 사용자는 첫 로그인 시 비밀번호를 변경해야 합니다.
            </p>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default UserModal;