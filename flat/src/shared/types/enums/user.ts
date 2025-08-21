/**
 * Authentication and Permission related enums
 */

// Permission Level
export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}

// Permission Level Labels (Korean)
export const PermissionLevelLabel: Record<PermissionLevel, string> = {
  [PermissionLevel.READ]: '읽기',
  [PermissionLevel.WRITE]: '쓰기',
  [PermissionLevel.DELETE]: '삭제',
  [PermissionLevel.ADMIN]: '관리',
};

// Authentication Status
export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
  ERROR = 'error',
}

// Login Method
export enum LoginMethod {
  EMAIL = 'email',
  GOOGLE = 'google',
  KAKAO = 'kakao',
  NAVER = 'naver',
  APPLE = 'apple',
}