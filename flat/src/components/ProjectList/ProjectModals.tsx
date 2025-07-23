import React, { lazy, Suspense } from 'react';
import type { Project } from '../../types/project';

// Lazy load modal components
const EmailModal = lazy(() => import('../EmailModal/index'));
const ProjectModal = lazy(() => import('../ProjectModal/index'));

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
  const handleEmailSend = (emailData: any) => {
    onSendEmail();
  };

  return (
    <>
      {showEmailModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
          <EmailModal 
            isOpen={showEmailModal}
            onClose={onCloseEmailModal}
            onSend={handleEmailSend}
            availableFactories={availableFactories}
          />
        </Suspense>
      )}
      
      {showProjectModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
          <ProjectModal
            isOpen={showProjectModal}
            onClose={onCloseProjectModal}
            onSave={onSaveProject}
            editData={editingProject}
            mode={modalMode}
          />
        </Suspense>
      )}
    </>
  );
};

export default ProjectModals;