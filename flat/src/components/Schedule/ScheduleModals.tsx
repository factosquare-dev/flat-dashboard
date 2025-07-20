import React from 'react';
import type { Participant, Task } from '../../types/schedule';
import EmailModal from '../EmailModal';
import WorkflowModal from '../WorkflowModal';
import TaskEditModal from '../TaskEditModal';
import ProductRequestModal from '../ProductRequestModal';
import TaskCreateModal from '../TaskCreateModal';
import { factories } from '../../data/factories';

interface ModalState {
  showEmailModal: boolean;
  showWorkflowModal: boolean;
  showTaskEditModal: boolean;
  showProductRequestModal: boolean;
  showTaskModal: boolean;
  selectedTask: Task | null;
  selectedFactories: string[];
  selectedProjectId: string | null;
  selectedDate: string | null;
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
  onTaskCreate: (task: { factory: string; taskType: string; startDate: string; endDate: string }) => void;
}

const ScheduleModals: React.FC<ScheduleModalsProps> = ({
  modalState,
  setModalState,
  projects,
  onTaskSave,
  onTaskDelete,
  onTaskCreate
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

  const handleTaskCreate = (task: { factory: string; taskType: string; startDate: string; endDate: string }) => {
    onTaskCreate(task);
    setModalState(prev => ({ ...prev, showTaskModal: false }));
  };

  return (
    <>
      <EmailModal
        isOpen={modalState.showEmailModal}
        onClose={() => setModalState(prev => ({ ...prev, showEmailModal: false }))}
        onSend={handleEmailSend}
        defaultRecipients={modalState.selectedFactories.length > 0 ? modalState.selectedFactories.join(', ') : ''}
        availableFactories={modalState.selectedFactories.length > 0 ? 
          modalState.selectedFactories.map(name => {
            const factory = factories.find(f => f.name === name);
            return {
              name,
              color: factory?.type === '제조' ? 'bg-blue-500' : 
                     factory?.type === '용기' ? 'bg-red-500' : 'bg-yellow-500',
              type: factory?.type || '공장'
            };
          }) : factories.map(f => ({
            name: f.name,
            color: f.type === '제조' ? 'bg-blue-500' : 
                   f.type === '용기' ? 'bg-red-500' : 'bg-yellow-500',
            type: f.type
          }))
        }
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

      <TaskCreateModal
        isOpen={modalState.showTaskModal}
        onClose={() => setModalState(prev => ({ ...prev, showTaskModal: false, selectedProjectId: null, selectedDate: null, selectedFactory: null }))}
        onSave={handleTaskCreate}
        availableFactories={projects.map(p => p.name)}
        initialDate={modalState.selectedDate || undefined}
        projectId={modalState.selectedProjectId || undefined}
        selectedFactory={modalState.selectedFactory || undefined}
      />
    </>
  );
};

export default ScheduleModals;