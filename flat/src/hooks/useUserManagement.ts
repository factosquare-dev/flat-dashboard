import { useState, useCallback, useEffect } from 'react';
import type { UserData } from './useUserFilter';
import type { UserFormData } from '../components/Users/UserModal';

const STORAGE_KEY = 'flat_users';

// 초기 샘플 데이터
const initialUsers: UserData[] = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    role: 'admin',
    department: 'IT팀',
    position: '팀장'
  },
  {
    id: '2',
    name: '이영희',
    email: 'lee@example.com',
    phone: '010-2345-6789',
    role: 'manager',
    department: '영업팀',
    position: '매니저'
  },
  {
    id: '3',
    name: '박민수',
    email: 'park@samsung.com',
    phone: '010-3456-7890',
    role: 'customer',
    department: '삼성전자',
    position: '과장'
  },
  {
    id: '4',
    name: '정수진',
    email: 'jung@lg.com',
    phone: '010-4567-8901',
    role: 'customer',
    department: 'LG전자',
    position: '대리'
  },
  {
    id: '5',
    name: '최동욱',
    email: 'choi@example.com',
    phone: '010-5678-9012',
    role: 'admin',
    department: '개발팀',
    position: '시니어 개발자'
  },
  {
    id: '6',
    name: '강미나',
    email: 'kang@example.com',
    phone: '010-6789-0123',
    role: 'manager',
    department: '마케팅팀',
    position: '팀장'
  },
  {
    id: '7',
    name: '윤서준',
    email: 'yoon@hyundai.com',
    phone: '010-7890-1234',
    role: 'customer',
    department: '현대자동차',
    position: '부장'
  },
  {
    id: '8',
    name: '임하나',
    email: 'lim@sk.com',
    phone: '010-8901-2345',
    role: 'customer',
    department: 'SK하이닉스',
    position: '차장'
  }
];

export const useUserManagement = () => {
  // localStorage에서 데이터 로드
  const loadUsers = (): UserData[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialUsers;
    } catch (error) {
      console.error('Failed to load users from localStorage:', error);
      return initialUsers;
    }
  };

  const [users, setUsers] = useState<UserData[]>(loadUsers);

  // localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users to localStorage:', error);
    }
  }, [users]);

  const addUser = useCallback((userData: UserFormData): UserData => {
    const newUser: UserData = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((userId: string, userData: UserFormData): boolean => {
    const userExists = users.some(u => u.id === userId);
    
    if (!userExists) {
      console.error(`User with id ${userId} not found`);
      return false;
    }

    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...userData, id: userId } : u
    ));
    
    return true;
  }, [users]);

  const deleteUser = useCallback((userId: string): boolean => {
    const userExists = users.some(u => u.id === userId);
    
    if (!userExists) {
      console.error(`User with id ${userId} not found`);
      return false;
    }

    setUsers(prev => prev.filter(user => user.id !== userId));
    return true;
  }, [users]);

  const getUserById = useCallback((userId: string): UserData | undefined => {
    return users.find(u => u.id === userId);
  }, [users]);

  const getUsersByRole = useCallback((role: UserData['role']): UserData[] => {
    return users.filter(u => u.role === role);
  }, [users]);

  const checkEmailExists = useCallback((email: string, excludeUserId?: string): boolean => {
    return users.some(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.id !== excludeUserId
    );
  }, [users]);

  const checkPhoneExists = useCallback((phone: string, excludeUserId?: string): boolean => {
    const normalizedPhone = phone.replace(/[^0-9]/g, '');
    return users.some(u => {
      const userPhone = u.phone.replace(/[^0-9]/g, '');
      return userPhone === normalizedPhone && u.id !== excludeUserId;
    });
  }, [users]);

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    getUsersByRole,
    checkEmailExists,
    checkPhoneExists,
  };
};