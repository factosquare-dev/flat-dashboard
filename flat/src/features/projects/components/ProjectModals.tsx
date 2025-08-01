import React, { lazy, useCallback } from 'react';
import type { Project } from '../../../types/project';
import LazyBoundary from '@/components/common/LazyBoundary';

// Lazy load modal components
const EmailModal = lazy(() => import('@/components/EmailModal/index'));
const ProjectModal = lazy(() => import('@/components/ProjectModal/index'));

interface ProjectModalsProps {
  showEmailModal: boolean;
  showProjectModal: boolean;
  modalMode: 'create' | 'edit';
  editingProject: Project | null;
  availableFactories: string[];
  onCloseEmailModal: () => void;
  onCloseProjectModal: () => void;
  onSaveProject: (projectData: Partial<Project>) => void;
  onSendEmail: () => void;
}

const ProjectModals: React.FC<ProjectModalsProps> = ({
  showEmailModal,
  showProjectModal,
  modalMode,
  editingProject,
  availableFactories,
  onCloseEmailModal,
  onCloseProjectModal,
  onSaveProject,
  onSendEmail
}) => {
  const handleEmailSend = useCallback((emailData: { 
    to: string; 
    subject: string; 
    body: string; 
    attachments?: File[] 
  }) => {
    onSendEmail();
  }, [onSendEmail]);

  return (
    <>
      {showEmailModal && (
        <LazyBoundary>
          <EmailModal 
            isOpen={showEmailModal}
            onClose={onCloseEmailModal}
            onSend={handleEmailSend}
            availableFactories={availableFactories}
          />
        </LazyBoundary>
      )}
      
      {showProjectModal && (
        <LazyBoundary>
          <ProjectModal
            isOpen={showProjectModal}
            onClose={onCloseProjectModal}
            onSave={onSaveProject}
            editData={editingProject}
            mode={modalMode}
          />
        </LazyBoundary>
      )}
    </>
  );
};

export default ProjectModals;