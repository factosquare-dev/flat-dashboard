import React, { useState } from 'react';
import { Users, Plus, MoreVertical } from 'lucide-react';
import type { UserRole } from '../../store/slices/userSlice';
import UserModal, { type UserFormData } from '../../components/Users/UserModal';

interface UserData extends UserFormData {
  id: string;
}

const UsersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'admin' | 'manager' | 'customer'>('admin');
  
  // 샘플 데이터
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      name: '김철수',
      email: 'kim@example.com',
      phone: '010-1234-5678',
      role: 'admin',
      department: 'IT',
      position: '팀장'
    },
    {
      id: '2',
      name: '이영희',
      email: 'lee@example.com',
      phone: '010-2345-6789',
      role: 'manager',
      department: '영업',
      position: '매니저'
    },
    {
      id: '3',
      name: '박민수',
      email: 'park@example.com',
      phone: '010-3456-7890',
      role: 'customer',
      department: '고객사',
      position: '대표'
    },
    {
      id: '4',
      name: '정수진',
      email: 'jung@example.com',
      phone: '010-4567-8901',
      role: 'customer',
      department: '코스모',
      position: '담당자'
    }
  ]);

  const filteredUsers = users.filter(user => user.role === activeTab);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData: UserFormData) => {
    if (editingUser) {
      // 수정
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...userData, id: editingUser.id } : u
      ));
    } else {
      // 추가
      const newUser: UserData = {
        ...userData,
        id: String(Date.now())
      };
      setUsers(prev => [...prev, newUser]);
    }
  };

  const getTabButtonClass = (tab: UserRole) => {
    return activeTab === tab
      ? 'px-6 py-2 rounded-full bg-blue-500 text-white'
      : 'px-6 py-2 rounded-full bg-gray-200 text-gray-700';
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="p-6">
        {/* 탭 버튼 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('admin')}
            className={getTabButtonClass('admin')}
          >
            관리자 추가
          </button>
          <button
            onClick={() => setActiveTab('manager')}
            className={getTabButtonClass('manager')}
          >
            고객 추가
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`${getTabButtonClass('customer')} ${activeTab === 'customer' ? 'bg-gray-600' : ''}`}
          >
            검색
          </button>
        </div>

        {/* 사용자 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.role === 'customer' ? 'bg-gray-100 text-gray-700' :
                    user.role === 'manager' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    수정
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    삭제
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="text-gray-500">회사:</span> {user.department || '코스모'}
                </div>
                <div>
                  <span className="text-gray-500">연락처:</span> {user.phone}
                </div>
                <div>
                  <span className="text-gray-500">이메일:</span> {user.email}
                </div>
              </div>
            </div>
          ))}
          
          {/* 추가 버튼 카드 */}
          <button
            onClick={handleAddUser}
            className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2"
          >
            <Plus className="w-8 h-8 text-gray-400" />
            <span className="text-gray-600">
              {activeTab === 'admin' ? '관리자 추가' : 
               activeTab === 'manager' ? '고객 추가' : 
               '사용자 추가'}
            </span>
          </button>
        </div>

        {/* 사용자 추가/수정 모달 */}
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          editData={editingUser}
        />
      </div>
    </div>
  );
};

export default UsersPage;