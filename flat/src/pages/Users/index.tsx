import React, { useState, useCallback } from 'react';
import UserModal, { type UserFormData } from '../../components/Users/UserModal';
import UserCard, { type UserData } from '../../components/Users/UserCard';
import UserToolbar from '../../components/Users/UserToolbar';
import { useUserFilter } from '../../hooks/useUserFilter';
import { useUserManagement } from '../../hooks/useUserManagement';

const UsersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  
  // 사용자 관리 훅 사용
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    checkEmailExists,
    checkPhoneExists,
  } = useUserManagement();

  // 필터링 로직을 커스텀 훅으로 분리
  const {
    selectedRole,
    searchTerm,
    filteredUsers,
    setSelectedRole,
    setSearchTerm,
  } = useUserFilter(users);

  const handleAddUser = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  const handleEditUser = useCallback((user: UserData) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    const success = deleteUser(userId);
    if (!success) {
      alert('사용자 삭제에 실패했습니다.');
    }
  }, [deleteUser]);

  const handleSaveUser = useCallback((userData: UserFormData) => {
    // 이메일 중복 확인
    if (checkEmailExists(userData.email, editingUser?.id)) {
      alert('이미 사용 중인 이메일입니다.');
      return;
    }

    // 전화번호 중복 확인
    if (checkPhoneExists(userData.phone, editingUser?.id)) {
      alert('이미 사용 중인 전화번호입니다.');
      return;
    }

    if (editingUser) {
      // 수정
      const success = updateUser(editingUser.id, userData);
      if (!success) {
        alert('사용자 수정에 실패했습니다.');
        return;
      }
    } else {
      // 추가
      addUser(userData);
    }
    
    setIsModalOpen(false);
    setEditingUser(null);
  }, [editingUser, addUser, updateUser, checkEmailExists, checkPhoneExists]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 상단 툴바 */}
      <UserToolbar
        selectedRole={selectedRole}
        searchTerm={searchTerm}
        onRoleChange={setSelectedRole}
        onSearchChange={setSearchTerm}
        onAddUser={handleAddUser}
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-auto p-6">
        {/* 사용자 수 표시 */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            총 {filteredUsers.length}명의 사용자
          </p>
        </div>

        {/* 사용자 카드 그리드 */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-lg mb-2">검색 결과가 없습니다</p>
            <p className="text-sm">다른 검색어를 시도해보세요</p>
          </div>
        )}
      </div>

      {/* 사용자 추가/수정 모달 */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        editData={editingUser}
      />
    </div>
  );
};

export default UsersPage;