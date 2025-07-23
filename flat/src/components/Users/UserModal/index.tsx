import React, { useState, useEffect } from 'react';
import BaseModal, { ModalFooter } from '../../common/BaseModal';
import { FormFields } from './FormFields';
import type { UserModalProps, UserFormData, FormErrors } from './types';
import { 
  formatPhoneNumber, 
  validateForm, 
  getDefaultDepartment, 
  getDefaultPosition 
} from './utils';

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    department: '',
    position: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData);
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'customer',
          department: '',
          position: ''
        });
      }
      setErrors({});
    }
  }, [editData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 초기화
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // role 변경 시 기본값 설정
    if (name === 'role') {
      if (value === 'admin' || value === 'manager') {
        setFormData(prev => ({
          ...prev,
          department: prev.department || getDefaultDepartment(value as any),
          position: prev.position || getDefaultPosition(value as any)
        }));
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
      onClose();
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? '사용자 수정' : '사용자 등록'}
      description="사용자 정보를 입력해주세요"
      size="md"
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
            form="user-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
          >
            {editData ? '수정' : '등록'}
          </button>
        </ModalFooter>
      }
    >
      <form id="user-form" onSubmit={handleSubmit}>
        <FormFields
          formData={formData}
          errors={errors}
          onChange={handleInputChange}
          onPhoneChange={handlePhoneChange}
        />
        
        {/* 수정 모드가 아닐 때 비밀번호 섹션 표시 */}
        {!editData && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              * 초기 비밀번호는 이메일 주소와 동일하게 설정됩니다.
            </p>
            <p className="text-sm text-gray-500">
              * 사용자는 첫 로그인 시 비밀번호를 변경해야 합니다.
            </p>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default UserModal;