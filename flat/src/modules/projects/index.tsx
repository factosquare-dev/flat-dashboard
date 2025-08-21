import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BasicInfoSection from './BasicInfoSection';
import ProductInfoSection from './ProductInfoSection';
import ProjectStatusSection from './ProjectStatusSection';
import ScheduleSection from './ScheduleSection';
import FactorySection from './FactorySection';
import BaseModal, { ModalFooter } from '@/shared/components/BaseModal';
import CommentSection from '@/components/CommentSection';
import type { ProjectModalProps, ProjectData } from './types';
import type { Comment } from '@/shared/types/comment';
import type { User } from '@/shared/types/user';
import { useProjectComments } from '@/shared/hooks/useProjectComments';
import { ProjectModalService } from '@/core/services/projectModal.service';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { ProjectStatusLabel, ProjectStatus, PriorityLabel, Priority, ServiceTypeLabel, ServiceType, ModalSize, ButtonVariant, ButtonSize } from '@/shared/types/enums';
import { useModalFormValidation } from '@/shared/hooks/useModalFormValidation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { getModalSizeString } from '@/shared/utils/modalUtils';
import './ProjectModal.css';

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, editData, mode }) => {
  const [formData, setFormData] = useState<ProjectData>(
    ProjectModalService.getInitialFormData()
  );

  // Define currentUser first
  const currentUser = useMemo((): User => ({
    id: 'current-user',
    name: '현재 사용자',
    avatar: ''
  }), []);

  // Use custom hook for comment management
  const {
    comments,
    handleAddComment,
    handleEditComment,
    handleDeleteComment
  } = useProjectComments(editData?.id || '', currentUser);

  // Add reaction handler
  const handleAddReaction = useCallback((commentId: string, emoji: string) => {
    const db = MockDatabaseImpl.getInstance();
    const dbUser = db.getCurrentUser();
    
    if (dbUser) {
      const success = db.addReaction(commentId, emoji, dbUser.id as string);
      if (success) {
        // Refresh comments by re-fetching from DB
        const updatedComments = db.getCommentsByProjectId(editData?.id || '');
        // Reaction added successfully
      }
    }
  }, [editData?.id]);

  useEffect(() => {
    if (editData && mode === 'edit') {
      // Convert Project to ProjectData with proper field mapping
      const formattedData = ProjectModalService.convertProjectToFormData(editData);
      setFormData(formattedData);
    } else {
      // Reset form for create mode
      setFormData(ProjectModalService.getInitialFormData());
    }
  }, [editData, mode]);

  // Validation rules
  const validationRules = useMemo(
    () => ProjectModalService.getValidationRules(formData),
    [formData.startDate]
  );

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
      // Save project with factories
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description="프로젝트 정보를 입력해주세요"
      size={getModalSizeString(ModalSize.LG)}
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
      <form ref={formRef} id="project-form" onSubmit={handleSubmit} className="project-modal__form">
          <div className="project-modal__content">
            {/* Validation error message */}
            {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
              <div className="project-modal__error">
                <AlertCircle className="project-modal__error-icon" />
                <span>필수 입력 항목을 모두 입력해주세요</span>
              </div>
            )}
            <BasicInfoSection formData={formData} onChange={updateFormData} />
            <ScheduleSection formData={formData} onChange={updateFormData} />
            <FactorySection formData={formData} onChange={updateFormData} />

            {/* 댓글 섹션 */}
            <CommentSection
              comments={comments}
              currentUser={currentUser}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onEditComment={handleEditComment}
              onAddReaction={handleAddReaction}
            />
          </div>
        </form>
    </BaseModal>
  );
};

export default React.memo(ProjectModal);