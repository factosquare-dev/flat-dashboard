import React, { useState, useEffect } from 'react';
import BasicInfoSection from './BasicInfoSection';
import ProductInfoSection from './ProductInfoSection';
import ProjectStatusSection from './ProjectStatusSection';
import ScheduleSection from './ScheduleSection';
import FactoryInfoSection from './FactoryInfoSection';
import AmountInfoSection from './AmountInfoSection';
import BaseModal, { ModalFooter } from '../common/BaseModal';
import CommentSection from '../CommentSection';
import type { ProjectModalProps, ProjectData } from './types';
import type { Comment } from '../../types/comment';
import type { User } from '../../types/user';

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, editData, mode }) => {
  const [formData, setFormData] = useState<ProjectData>({
    client: '',
    manager: '',
    productType: '',
    serviceType: 'OEM',
    status: '시작전',
    priority: '보통',
    startDate: '',
    endDate: '',
    manufacturer: '',
    container: '',
    packaging: '',
    sales: '',
    purchase: '',
    description: ''
  });

  // Mock current user - 실제로는 전역 상태나 props로 받아야 함
  const currentUser: User = {
    id: 'current-user',
    name: '현재 사용자',
    avatar: ''
  };

  // Mock comments - 실제로는 API에서 가져와야 함
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: '이 프로젝트 진행 상황이 궁금합니다. @김철수 님 확인 부탁드려요.',
      author: { id: '1', name: '이영희', avatar: '' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      projectId: editData?.id || '',
      mentions: [{ id: '2', name: '김철수' }]
    },
    {
      id: '2',
      content: '@이영희 현재 제조 단계 진행 중입니다. 예정대로 진행되고 있어요.',
      author: { id: '2', name: '김철수', avatar: '' },
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      parentId: '1',
      projectId: editData?.id || '',
      mentions: [{ id: '1', name: '이영희' }]
    }
  ]);

  const handleAddComment = (content: string, parentId?: string, mentions?: string[]) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: currentUser,
      createdAt: new Date().toISOString(),
      projectId: editData?.id || '',
      parentId,
      mentions: mentions ? mentions.map(id => ({ id, name: '사용자' })) : undefined
    };

    // 모든 댓글은 플랫하게 저장 (1단계로만 표시)
    setComments(prevComments => [...prevComments, newComment]);

    // TODO: API 호출하여 댓글 저장
    // TODO: 멘션된 사용자에게 알림 전송
  };

  const handleEditComment = (commentId: string, content: string) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content, updatedAt: new Date().toISOString() }
          : comment
      )
    );
    // TODO: API 호출하여 댓글 수정
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    // TODO: API 호출하여 댓글 삭제
  };

  useEffect(() => {
    if (editData && mode === 'edit') {
      setFormData(editData);
    } else {
      // Reset form for create mode
      setFormData({
        client: '',
        manager: '',
        productType: '',
        serviceType: 'OEM',
        status: '시작전',
        priority: '보통',
        startDate: '',
        endDate: '',
        manufacturer: '',
        container: '',
        packaging: '',
        sales: '',
        purchase: '',
        description: ''
      });
    }
  }, [editData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const updateFormData = (updates: Partial<ProjectData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '새 프로젝트 생성' : '프로젝트 수정'}
      description="프로젝트 정보를 입력해주세요"
      size="xl"
      footer={
        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            form="project-form"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-sm"
          >
            {mode === 'create' ? '생성' : '수정'}
          </button>
        </ModalFooter>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="bg-gray-50 -mx-6 -my-6 px-6 py-6">
          <div className="space-y-6">
            <BasicInfoSection formData={formData} onChange={updateFormData} />
            <ProductInfoSection formData={formData} onChange={updateFormData} />
            <ProjectStatusSection formData={formData} onChange={updateFormData} />
            <ScheduleSection formData={formData} onChange={updateFormData} />
            <FactoryInfoSection formData={formData} onChange={updateFormData} />
            <AmountInfoSection formData={formData} onChange={updateFormData} />

            {/* 댓글 섹션 */}
            <CommentSection
              projectId={editData?.id || 'new'}
              comments={comments}
              currentUser={currentUser}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onEditComment={handleEditComment}
            />
          </div>
        </form>
    </BaseModal>
  );
};

export default ProjectModal;