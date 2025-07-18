import React from 'react';
import type { Participant, Task } from '../../types/schedule';
import EmailModal from '../EmailModal';
import WorkflowModal from '../WorkflowModal';
import TaskEditModal from '../TaskEditModal';
import ProductRequestModal from '../ProductRequestModal';

interface ModalState {
  showEmailModal: boolean;
  showWorkflowModal: boolean;
  showTaskEditModal: boolean;
  showProductRequestModal: boolean;
  selectedTask: Task | null;
  selectedFactories: string[];
  hoveredTaskId: number | null;
  draggedProjectIndex: number | null;
  dragOverProjectIndex: number | null;
  isDraggingTask: boolean;
  draggedTask: Task | null;
  isResizingTask: boolean;
  resizeDirection: 'start' | 'end' | null;
  resizingTask: Task | null;
}

interface ScheduleModalsProps {
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  projects: Participant[];
  onTaskSave: (task: Task) => void;
  onTaskDelete: () => void;
}

const ScheduleModals: React.FC<ScheduleModalsProps> = ({
  modalState,
  setModalState,
  projects,
  onTaskSave,
  onTaskDelete
}) => {
  const handleEmailSend = (data: any) => {
    console.log('Email sent:', data);
    setModalState(prev => ({ ...prev, showEmailModal: false }));
  };

  const handleWorkflowClose = () => {
    setModalState(prev => ({ ...prev, showWorkflowModal: false }));
  };

  const handleTaskEditClose = () => {
    setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
  };

  const handleProductRequestSave = (data: any) => {
    console.log('Product request:', data);
    setModalState(prev => ({ ...prev, showProductRequestModal: false }));
  };

  return (
    <>
      <EmailModal
        isOpen={modalState.showEmailModal}
        onClose={() => setModalState(prev => ({ ...prev, showEmailModal: false }))}
        onSend={handleEmailSend}
        availableFactories={projects.map(p => p.name)}
      />

      <WorkflowModal
        isOpen={modalState.showWorkflowModal}
        onClose={handleWorkflowClose}
      />

      {modalState.selectedTask && (
        <TaskEditModal
          isOpen={modalState.showTaskEditModal}
          onClose={handleTaskEditClose}
          task={modalState.selectedTask}
          onSave={onTaskSave}
          onDelete={onTaskDelete}
        />
      )}

      <ProductRequestModal
        isOpen={modalState.showProductRequestModal}
        onClose={() => setModalState(prev => ({ ...prev, showProductRequestModal: false }))}
        onSave={handleProductRequestSave}
      />
    </>
  );
};

export default ScheduleModals;