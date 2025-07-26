import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { managerNames } from '../../data/mockData';
import { ProjectStatusLabel, ProjectStatus, PriorityLabel, Priority, ServiceTypeLabel, ServiceType, ModalSize, ButtonVariant, ButtonSize } from '../../types/enums';
import { useModalFormValidation } from '../../hooks/useModalFormValidation';
import { AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { getModalSizeString } from '../../utils/modalUtils';
import './ProjectModal.css';

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, editData, mode }) => {
  const [formData, setFormData] = useState<ProjectData>({
    client: '',
    manager: '',
    productType: '',
    serviceType: ServiceType.OEM,
    status: ProjectStatus.PLANNING,
    priority: Priority.MEDIUM,
    startDate: '',
    endDate: '',
    manufacturer: '',
    container: '',
    packaging: '',
    sales: '',
    purchase: '',
    description: ''
  });


  // Mock DB에서 매니저 이름 가져오기
  const getRandomManagerName = () => {
    return managerNames.length > 0 ? managerNames[Math.floor(Math.random() * managerNames.length)] : '담당자';
  };
  
  const manager1 = getRandomManagerName();
  const manager2 = getRandomManagerName();
  
  // Mock comments - 실제로는 API에서 가져와야 함
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: `이 프로젝트 진행 상황이 궁금합니다. @${manager2} 님 확인 부탁드려요.`,
      author: { id: '1', name: manager1, avatar: '' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      projectId: editData?.id || '',
      mentions: [{ id: '2', name: manager2 }]
    },
    {
      id: '2',
      content: `@${manager1} 현재 제조 단계 진행 중입니다. 예정대로 진행되고 있어요.`,
      author: { id: '2', name: manager2, avatar: '' },
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      parentId: '1',
      projectId: editData?.id || '',
      mentions: [{ id: '1', name: manager1 }]
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
        serviceType: ServiceType.OEM,
        status: ProjectStatus.PLANNING,
        priority: Priority.MEDIUM,
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

  // Validation rules
  const validationRules = {
    client: { required: true },
    manager: { required: true },
    productType: { required: true },
    serviceType: { required: true },
    startDate: { required: true },
    endDate: { 
      required: true,
      custom: (value: string) => {
        if (value && formData.startDate && value < formData.startDate) {
          return '종료일은 시작일보다 늦어야 합니다';
        }
        return null;
      }
    }
  };

  const {
    errors,
    touched,
    formRef,
    handleSubmit: handleFormSubmit,
    validateForm,
    isSubmitting
  } = useModalFormValidation(formData, {
    rules: validationRules,
    onSubmit: async (data) => {
      await onSave(data);
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    handleFormSubmit(e);
  };

  const updateFormData = useCallback((updates: Partial<ProjectData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const modalTitle = useMemo(() => 
    mode === 'create' ? '새 프로젝트 생성' : '프로젝트 수정', 
    [mode]
  );

  const currentUser = useMemo((): User => ({
    id: 'current-user',
    name: '현재 사용자',
    avatar: ''
  }), []);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description="프로젝트 정보를 입력해주세요"
      size={getModalSizeString(ModalSize.XL)}
      footer={
        <ModalFooter>
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MD}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.MD}
            type="submit"
            form="project-form"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {mode === 'create' ? '생성' : '수정'}
          </Button>
        </ModalFooter>
      }
    >
      <form ref={formRef} id="project-form" onSubmit={handleSubmit} className="bg-gray-50 -mx-6 -my-6 px-6 py-6">
          <div className="modal-section-spacing">
            {/* Validation error message */}
            {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
              <div className="project-modal__error">
                <AlertCircle className="project-modal__error-icon" />
                <span>필수 입력 항목을 모두 입력해주세요</span>
              </div>
            )}
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

export default React.memo(ProjectModal);