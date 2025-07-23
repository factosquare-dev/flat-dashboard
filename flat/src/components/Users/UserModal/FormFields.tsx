import React from 'react';
import type { UserFormData, FormErrors } from './types';
import { getRoleLabel, getDepartmentLabel, getPositionLabel } from './utils';

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
    <div className="space-y-4">
      {/* 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="홍길동"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* 역할 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          역할 <span className="text-red-500">*</span>
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="customer">{getRoleLabel('customer')}</option>
          <option value="manager">{getRoleLabel('manager')}</option>
          <option value="admin">{getRoleLabel('admin')}</option>
        </select>
      </div>

      {/* 이메일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일 <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="example@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* 전화번호 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          전화번호 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onPhoneChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phone ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="010-1234-5678"
          maxLength={13}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* 부서/회사명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {getDepartmentLabel(formData.role)} {formData.role === 'customer' && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="department"
          value={formData.department || ''}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.department ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={formData.role === 'customer' ? '삼성전자' : 'IT팀'}
        />
        {errors.department && (
          <p className="mt-1 text-sm text-red-600">{errors.department}</p>
        )}
      </div>

      {/* 직위/직책 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {getPositionLabel(formData.role)}
        </label>
        <input
          type="text"
          name="position"
          value={formData.position || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={formData.role === 'customer' ? '과장' : '팀장'}
        />
      </div>
    </div>
  );
};