import React, { useCallback, useState } from 'react';
import UserModal, { type UserFormData } from '../../components/Users/UserModal';
import UserCard, { type UserData } from '../../components/Users/UserCard';
import UserToolbar from '@/components/Users/UserToolbar';
import FloatingActionButton from '@/components/common/FloatingActionButton';
import { useUserFilter } from '@/hooks/useUserFilter';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useModalState } from '@/hooks/useModalState';
import { UserPlus, Users } from 'lucide-react';
import { LoadingState } from '@/components/loading/LoadingState';
import { EmptyState } from '@/components/common';
import { ButtonVariant } from '@/types/enums';

const UsersPage: React.FC = () => {
  const modalState = useModalState<UserData | null>(false, null);
  const [isLoading] = useState(false);
  
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
    modalState.open(null);
  }, [modalState]);

  const handleEditUser = useCallback((user: UserData) => {
    modalState.open(user);
  }, [modalState]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    const success = await deleteUser(userId);
    if (!success) {
      alert('사용자 삭제에 실패했습니다.');
    }
  }, [deleteUser]);

  const handleSaveUser = useCallback(async (userData: UserFormData) => {
    // 이메일 중복 확인
    if (checkEmailExists(userData.email, modalState.data?.id)) {
      alert('이미 사용 중인 이메일입니다.');
      return;
    }

    // 전화번호 중복 확인
    if (checkPhoneExists(userData.phone, modalState.data?.id)) {
      alert('이미 사용 중인 전화번호입니다.');
      return;
    }

    if (modalState.data) {
      // 수정
      const success = await updateUser(modalState.data.id, userData);
      if (!success) {
        alert('사용자 수정에 실패했습니다.');
        return;
      }
    } else {
      // 추가
      const newUser = await addUser(userData);
      if (!newUser) {
        alert('사용자 추가에 실패했습니다.');
        return;
      }
    }
    
    modalState.close();
  }, [modalState, addUser, updateUser, checkEmailExists, checkPhoneExists]);

  const handleCloseModal = useCallback(() => {
    modalState.close();
  }, [modalState]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 상단 툴바 */}
      <UserToolbar
        selectedRole={selectedRole}
        searchTerm={searchTerm}
        onRoleChange={setSelectedRole}
        onSearchChange={setSearchTerm}
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
        <LoadingState
          isLoading={isLoading}
          error={null}
          isEmpty={filteredUsers.length === 0}
          emptyComponent={
            <EmptyState
              icon={<Users />}
              title={searchTerm ? '검색 결과가 없습니다' : '등록된 사용자가 없습니다'}
              description={searchTerm ? '다른 검색어를 시도해보세요' : '새로운 사용자를 추가해보세요'}
              action={
                !searchTerm ? {
                  label: '사용자 추가',
                  onClick: handleAddUser
                } : undefined
              }
            />
          }
        >
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
        </LoadingState>
      </div>

      {/* 플로팅 액션 버튼 - 새 사용자 추가 */}
      <FloatingActionButton
        onClick={handleAddUser}
        icon={<UserPlus />}
        label="새 사용자 추가"
        variant={ButtonVariant.PRIMARY}
        position="first"
      />

      {/* 사용자 추가/수정 모달 */}
      <UserModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        editData={modalState.data}
      />
    </div>
  );
};

export default UsersPage;