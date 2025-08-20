import type { UserRole } from '@/store/slices/userSlice';
import type { UserFormData, FormErrors } from './types';
import { UserRole as UserRoleEnum } from '@/types/enums';

export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

export const validateForm = (formData: UserFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.name.trim()) {
    errors.name = '이름을 입력해주세요';
  }

  if (!formData.email.trim()) {
    errors.email = '이메일을 입력해주세요';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다';
  }

  if (!formData.phone.trim()) {
    errors.phone = '전화번호를 입력해주세요';
  } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
    errors.phone = '올바른 전화번호 형식이 아닙니다';
  }

  if (formData.role === UserRoleEnum.CUSTOMER && !formData.department?.trim()) {
    errors.department = '회사명을 입력해주세요';
  }

  return errors;
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRoleEnum.ADMIN: return '관리자';
    case UserRoleEnum.MANAGER: return '매니저';
    case UserRoleEnum.CUSTOMER: return '고객';
    default: return role;
  }
};

export const getDepartmentLabel = (role: UserRole): string => {
  return role === UserRoleEnum.CUSTOMER ? '회사명' : '부서명';
};

export const getPositionLabel = (role: UserRole): string => {
  return role === UserRoleEnum.CUSTOMER ? '직책' : '직위';
};

export const getDefaultDepartment = (role: UserRole): string => {
  return role === UserRoleEnum.ADMIN || role === UserRoleEnum.MANAGER ? 'FLAT' : '';
};

export const getDefaultPosition = (role: UserRole): string => {
  if (role === UserRoleEnum.ADMIN) return '관리자';
  if (role === UserRoleEnum.MANAGER) return '매니저';
  return '';
};