import { useState, useMemo } from 'react';
import type { UserRole } from '../store/slices/userSlice';

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  position?: string;
}

interface UseUserFilterReturn {
  selectedRole: UserRole;
  searchTerm: string;
  filteredUsers: UserData[];
  setSelectedRole: (role: UserRole) => void;
  setSearchTerm: (term: string) => void;
}

export const useUserFilter = (users: UserData[]): UseUserFilterReturn => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 역할 필터링
      const matchesRole = user.role === selectedRole;
      
      // 검색어가 없으면 역할만 확인
      if (!searchTerm.trim()) {
        return matchesRole;
      }

      // 검색어 필터링
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchTerm) || // 전화번호는 숫자 그대로 검색
        (user.department?.toLowerCase().includes(searchLower) ?? false) ||
        (user.position?.toLowerCase().includes(searchLower) ?? false);
      
      return matchesRole && matchesSearch;
    });
  }, [users, selectedRole, searchTerm]);

  return {
    selectedRole,
    searchTerm,
    filteredUsers,
    setSelectedRole,
    setSearchTerm,
  };
};