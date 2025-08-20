import React from 'react';
import type { UserFormData, FormErrors } from './types';
import { getRoleLabel, getDepartmentLabel, getPositionLabel } from './utils';
import { UserRole } from '@/shared/types/enums';

interface FormFieldsProps {
  formData: UserFormData;
  errors: FormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  errors,
  onChange,
  onPhoneChange
}) => {
  return (
    <div className="modal-section-spacing">
      {/* 이름 */}
      <div className="modal-field-spacing">
        <label className="modal-field-label">이름 *</label>
        <input
          type="text"
          name="name"
          className={`modal-input ${errors.name ? 'border-red-400' : ''}`}
          value={formData.name}
          onChange={onChange}
          placeholder="홍길동"
        />
        {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
      </div>

      {/* 역할 */}
      <div className="modal-field-spacing">
        <label className="modal-field-label">역할 *</label>
        <select
          name="role"
          className="modal-input"
          value={formData.role}
          onChange={onChange}
        >
          <option value="">역할을 선택하세요</option>
          <option value={UserRole.CUSTOMER}>{getRoleLabel(UserRole.CUSTOMER)}</option>
          <option value={UserRole.MANAGER}>{getRoleLabel(UserRole.MANAGER)}</option>
          <option value={UserRole.ADMIN}>{getRoleLabel(UserRole.ADMIN)}</option>
        </select>
      </div>

      {/* 이메일 */}
      <div className="modal-field-spacing">
        <label className="modal-field-label">이메일 *</label>
        <input
          type="email"
          name="email"
          className={`modal-input ${errors.email ? 'border-red-400' : ''}`}
          value={formData.email}
          onChange={onChange}
          placeholder="example@email.com"
        />
        {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
      </div>

      {/* 전화번호 */}
      <div className="modal-field-spacing">
        <label className="modal-field-label">전화번호 *</label>
        <input
          type="tel"
          name="phone"
          className={`modal-input ${errors.phone ? 'border-red-400' : ''}`}
          value={formData.phone}
          onChange={onPhoneChange}
          placeholder="010-1234-5678"
          maxLength={13}
        />
        {errors.phone && <div className="text-red-600 text-xs mt-1">{errors.phone}</div>}
      </div>

      {/* 부서/회사명 */}
      <div className="modal-field-spacing">
        <label className="modal-field-label">
          {getDepartmentLabel(formData.role)} {formData.role === UserRole.CUSTOMER && '*'}
        </label>
        <input
          type="text"
          name="department"
          className={`modal-input ${errors.department ? 'border-red-400' : ''}`}
          value={formData.department || ''}
          onChange={onChange}
          placeholder={formData.role === UserRole.CUSTOMER ? '삼성전자' : 'IT팀'}
        />
        {errors.department && <div className="text-red-600 text-xs mt-1">{errors.department}</div>}
      </div>

      {/* 직위/직책 */}
      <div className="modal-field-spacing">
        <label className="modal-field-label">{getPositionLabel(formData.role)}</label>
        <input
          type="text"
          name="position"
          className="modal-input"
          value={formData.position || ''}
          onChange={onChange}
          placeholder={formData.role === UserRole.CUSTOMER ? '과장' : '팀장'}
        />
      </div>
    </div>
  );
};