import React from 'react';
import type { Project } from '../../types/project';
import EmailModal from '../EmailModal';
import ProjectModal from '../ProjectModal';

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
    console.log('Email sent:', emailData);
    onSendEmail();
  };

  return (
    <>
      <EmailModal 
        isOpen={showEmailModal}
        onClose={onCloseEmailModal}
        onSend={handleEmailSend}
        availableFactories={availableFactories}
      />
      
      <ProjectModal
        isOpen={showProjectModal}
        onClose={onCloseProjectModal}
        onSave={onSaveProject}
        editData={editingProject}
        mode={modalMode}
      />
    </>
  );
};

export default ProjectModals;