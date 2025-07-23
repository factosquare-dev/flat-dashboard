import React, { lazy, Suspense } from 'react';
import type { Participant, Task } from '../../types/schedule';
import { factories } from '../../data/factories';

// Lazy load all modal components
const EmailModal = lazy(() => import('../EmailModal/index'));
const WorkflowModal = lazy(() => import('../WorkflowModal'));
const TaskEditModal = lazy(() => import('../TaskEditModal'));
const ProductRequestModal = lazy(() => import('../ProductRequestModal/index'));
const TaskCreateModal = lazy(() => import('../TaskCreateModal'));
const FactorySelectionModal = lazy(() => import('./FactorySelectionModal'));

interface ModalState {
  showEmailModal: boolean;
  showWorkflowModal: boolean;
  showTaskEditModal: boolean;
  showProductRequestModal: boolean;
  showTaskModal: boolean;
  showFactoryModal: boolean;
  selectedTask: Task | null;
  selectedFactories: string[];
  selectedProjectId: string | null;
  selectedDate: string | null;
  selectedFactory: string | null;
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
  onFactoryAdd?: (factory: { id: string; name: string; type: string }) => void;
}

const ScheduleModals: React.FC<ScheduleModalsProps> = ({
  modalState,
  setModalState,
  projects,
  onTaskSave,
  onTaskDelete,
  onTaskCreate,
  onFactoryAdd
}) => {
  const handleEmailSend = (data: any) => {
    setModalState(prev => ({ ...prev, showEmailModal: false }));
  };

  const handleWorkflowClose = () => {
    setModalState(prev => ({ ...prev, showWorkflowModal: false }));
  };

  const handleTaskEditClose = () => {
    setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
  };

  const handleProductRequestSave = (data: any) => {
    setModalState(prev => ({ ...prev, showProductRequestModal: false }));
  };

  const handleTaskCreate = (task: { factory: string; taskType: string; startDate: string; endDate: string }) => {
    onTaskCreate(task);
    setModalState(prev => ({ ...prev, showTaskModal: false }));
  };

  const handleFactoriesSelect = (selectedFactories: Array<{ id: string; name: string; type: string }>) => {
    if (onFactoryAdd) {
      // 선택된 각 공장을 추가
      selectedFactories.forEach(factory => {
        onFactoryAdd(factory);
      });
    }
    setModalState(prev => ({ ...prev, showFactoryModal: false }));
  };

  return (
    <>
      <EmailModal
        isOpen={modalState.showEmailModal}
        onClose={() => setModalState(prev => ({ ...prev, showEmailModal: false }))}
        onSend={handleEmailSend}
        defaultRecipients={modalState.selectedFactories?.length > 0 ? modalState.selectedFactories.join(', ') : ''}
        availableFactories={
          modalState.selectedFactories?.length > 0 ? 
            // 선택된 공장들만 표시
            modalState.selectedFactories.map(name => {
              const factory = factories.find(f => f.name === name);
              return {
                name,
                color: factory?.type === '제조' ? 'bg-blue-500' : 
                       factory?.type === '용기' ? 'bg-red-500' : 'bg-yellow-500',
                type: factory?.type || '공장'
              };
            }) : 
            // 선택된 것이 없으면 현재 간트차트에 표시된 프로젝트(공장)들만 보여줌
            projects.map(project => ({
              name: project.name,
              color: project.type === '제조' ? 'bg-blue-500' : 
                     project.type === '용기' ? 'bg-red-500' : 'bg-yellow-500',
              type: project.type || '공장'
            }))
        }
      />

      <WorkflowModal
        isOpen={modalState.showWorkflowModal}
        onClose={handleWorkflowClose}
        factories={factories}
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

      <FactorySelectionModal
        isOpen={modalState.showFactoryModal}
        onClose={() => setModalState(prev => ({ ...prev, showFactoryModal: false }))}
        onSelectFactories={handleFactoriesSelect}
      />
    </>
  );
};

export default ScheduleModals;