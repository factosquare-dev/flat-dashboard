/**
 * User and Authentication related enums
 */

// User Role
export enum UserRole {
  // System Internal Roles (우리 시스템 내부 사용자)
  ADMIN = 'admin',                    // 시스템 관리자
  PRODUCT_MANAGER = 'product_manager', // PM (프로젝트/제품 담당자)
  SALES_MANAGER = 'sales_manager',     // 영업 담당자
  CS_MANAGER = 'cs_manager',          // 고객 서비스 담당자
  DEVELOPER = 'developer',            // 개발자
  QA = 'qa',                         // 품질 관리
  
  // External Roles (외부 사용자)
  FACTORY_MANAGER = 'factory_manager',     // 공장 관리자 (공장측)
  FACTORY_OPERATOR = 'factory_operator',   // 공장 작업자 (공장측)
  CUSTOMER_MANAGER = 'customer_manager',   // 고객사 담당자
  CUSTOMER_USER = 'customer_user',         // 고객사 일반 사용자
  
  // Limited Access
  GUEST = 'guest',                    // 게스트
  VIEWER = 'viewer',                  // 읽기 전용 사용자
}

// User Role Labels (Korean)
export const UserRoleLabel: Record<UserRole, string> = {
  // Internal
  [UserRole.ADMIN]: '시스템 관리자',
  [UserRole.PRODUCT_MANAGER]: '프로젝트 매니저',
  [UserRole.SALES_MANAGER]: '영업 담당자',
  [UserRole.CS_MANAGER]: '고객 서비스',
  [UserRole.DEVELOPER]: '개발자',
  [UserRole.QA]: '품질 관리',
  
  // External
  [UserRole.FACTORY_MANAGER]: '공장 관리자',
  [UserRole.FACTORY_OPERATOR]: '공장 작업자',
  [UserRole.CUSTOMER_MANAGER]: '고객사 담당자',
  [UserRole.CUSTOMER_USER]: '고객사 사용자',
  
  // Limited
  [UserRole.GUEST]: '게스트',
  [UserRole.VIEWER]: '뷰어',
};

// Role Categories for grouping
export const RoleCategory = {
  INTERNAL: [
    UserRole.ADMIN,
    UserRole.PRODUCT_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.CS_MANAGER,
    UserRole.DEVELOPER,
    UserRole.QA,
  ],
  FACTORY: [
    UserRole.FACTORY_MANAGER,
    UserRole.FACTORY_OPERATOR,
  ],
  CUSTOMER: [
    UserRole.CUSTOMER_MANAGER,
    UserRole.CUSTOMER_USER,
  ],
  LIMITED: [
    UserRole.GUEST,
    UserRole.VIEWER,
  ],
};

// User Status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

// User Status Labels (Korean)
export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: '활성',
  [UserStatus.INACTIVE]: '비활성',
  [UserStatus.PENDING]: '대기중',
  [UserStatus.SUSPENDED]: '정지',
  [UserStatus.DELETED]: '삭제됨',
};

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