import React from 'react';
import { Search } from 'lucide-react';
import type { UserRole } from '@/store/slices/userSlice';
import { UserRole as UserRoleEnum } from '@/shared/types/user';

interface UserToolbarProps {
  selectedRole: UserRole;
  searchTerm: string;
  onRoleChange: (role: UserRole) => void;
  onSearchChange: (term: string) => void;
}

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: UserRoleEnum.ADMIN, label: '관리자' },
  { value: UserRoleEnum.INTERNAL_MANAGER, label: '매니저' },
  { value: UserRoleEnum.EXTERNAL_MANAGER, label: '공장 관계자' },
  { value: UserRoleEnum.CUSTOMER, label: '고객' },
];

const UserToolbar: React.FC<UserToolbarProps> = ({
  selectedRole,
  searchTerm,
  onRoleChange,
  onSearchChange,
}) => {
  const getRoleButtonClass = (role: UserRole) => {
    return selectedRole === role
      ? 'px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-200'
      : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 역할 필터 */}
        <div className="flex gap-3">
          {USER_ROLES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onRoleChange(value)}
              className={getRoleButtonClass(value)}
              aria-pressed={selectedRole === value}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 검색 입력창 */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="이름, 이메일, 전화번호, 부서로 검색..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              aria-label="사용자 검색"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserToolbar;