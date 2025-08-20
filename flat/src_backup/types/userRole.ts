import { UserRole, InternalManagerType } from './user';

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.ADMIN]: '관리자',
  [UserRole.INTERNAL_MANAGER]: '매니저',
  [UserRole.EXTERNAL_MANAGER]: '공장 관계자',
  [UserRole.CUSTOMER]: '고객'
};

export const InternalManagerTypeLabel: Record<InternalManagerType, string> = {
  [InternalManagerType.SALES]: '영업',
  [InternalManagerType.CONTENT]: '내용물',
  [InternalManagerType.CONTAINER]: '용기',
  [InternalManagerType.QA]: 'QA',
  [InternalManagerType.RA]: 'RA'
};