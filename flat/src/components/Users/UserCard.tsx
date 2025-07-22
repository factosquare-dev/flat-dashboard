import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, User } from 'lucide-react';
import type { UserRole } from '../../store/slices/userSlice';

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  position?: string;
}

interface UserCardProps {
  user: UserData;
  onEdit: (user: UserData) => void;
  onDelete: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleEdit = () => {
    onEdit(user);
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`정말로 ${user.name}님을 삭제하시겠습니까?`)) {
      onDelete(user.id);
    }
    setIsDropdownOpen(false);
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { text: '관리자', class: 'bg-purple-100 text-purple-700' };
      case 'manager':
        return { text: '매니저', class: 'bg-green-100 text-green-700' };
      case 'customer':
        return { text: '고객', class: 'bg-blue-100 text-blue-700' };
      default:
        return { text: role, class: 'bg-gray-100 text-gray-700' };
    }
  };

  const roleDisplay = getRoleDisplay(user.role);

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* 카드 헤더 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleDisplay.class}`}>
                {roleDisplay.text}
              </span>
            </div>
          </div>
          
          {/* 드롭다운 메뉴 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="옵션 메뉴"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 transition-colors border-t border-gray-100"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 카드 바디 */}
      <div className="p-6">
        <div className="space-y-3">
          {(user.department || user.position) && (
            <div className="text-sm">
              <span className="text-gray-500">소속: </span>
              <span className="text-gray-600">
                {user.department}
                {user.position && ` · ${user.position}`}
              </span>
            </div>
          )}
          
          <div className="text-sm">
            <span className="text-gray-500">이메일: </span>
            <a 
              href={`mailto:${user.email}`} 
              className="text-gray-600 hover:text-blue-600 transition-colors truncate"
              title={user.email}
            >
              {user.email}
            </a>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-500">연락처: </span>
            <a 
              href={`tel:${user.phone}`} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {user.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;