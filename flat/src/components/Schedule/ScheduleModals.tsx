import React, { lazy, Suspense } from 'react';
import type { ScheduleFactory, Task } from '../../types/schedule';
import { factories } from '@/data/factories';
import { getFactoryTypeColor } from '@/utils/factoryUtils';

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
  selectedFactoryId: string | null;
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
  projects: ScheduleFactory[];
  projectId?: string;
  onTaskSave: (task: Task) => void;
  onTaskDelete: () => void;
  onTaskCreate: (task: { factory: string; taskType: string; startDate: string; endDate: string }) => void;
  onFactoryAdd?: (factory: { id: string; name: string; type: string }) => void;
  onFactoriesAdd?: (factories: Array<{ id: string; name: string; type: string }>) => void;
}

const ScheduleModals: React.FC<ScheduleModalsProps> = ({
  modalState,
  setModalState,
  projects,
  projectId,
  onTaskSave,
  onTaskDelete,
  onTaskCreate,
  onFactoryAdd,
  onFactoriesAdd
}) => {
  const handleEmailSend = () => {
    setModalState(prev => ({ ...prev, showEmailModal: false }));
  };

  const handleWorkflowClose = () => {
    setModalState(prev => ({ ...prev, showWorkflowModal: false }));
  };

  const handleTaskEditClose = () => {
    setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
  };

  const handleProductRequestSave = () => {
    setModalState(prev => ({ ...prev, showProductRequestModal: false }));
  };

  const handleTaskCreate = (task: { factory: string; taskType: string; startDate: string; endDate: string }) => {
    onTaskCreate(task);
    setModalState(prev => ({ ...prev, showTaskModal: false }));
  };

  const handleFactoriesSelect = (selectedFactories: Array<{ id: string; name: string; type: string }>) => {
    if (onFactoriesAdd) {
      // 새로운 함수를 사용해서 여러 공장을 한 번에 추가
      onFactoriesAdd(selectedFactories);
    } else if (onFactoryAdd) {
      // fallback: 기존 방식 사용
      selectedFactories.forEach(factory => {
        onFactoryAdd(factory);
      });
    }
    setModalState(prev => ({ ...prev, showFactoryModal: false }));
  };

  return (
    <>
      <Suspense fallback={null}>
        <EmailModal
          isOpen={modalState.showEmailModal}
          onClose={() => setModalState(prev => ({ ...prev, showEmailModal: false }))}
          onSend={handleEmailSend}
          defaultRecipients={modalState.selectedFactories?.length > 0 ? modalState.selectedFactories.join(', ') : ''}
          availableFactories={
            modalState.selectedFactories?.length > 0 ? 
              // 선택된 공장들만 표시
              modalState.selectedFactories.map(nameOrId => {
                // ID인지 이름인지 확인하여 처리
                let factory = factories.find(f => f.id === nameOrId);
                if (!factory) {
                  // ID로 찾지 못했으면 이름으로 검색 (하위 호환성)
                  factory = factories.find(f => f.name === nameOrId);
                }
                return {
                  id: factory?.id || nameOrId,
                  name: factory?.name || nameOrId,
                  color: getFactoryTypeColor(factory?.type || ''),
                  type: factory?.type || '공장'
                };
              }) : 
              // 선택된 것이 없으면 현재 간트차트에 표시된 프로젝트(공장)들만 보여줌
              projects.map(project => ({
                name: project.name,
                color: getFactoryTypeColor(project.type || ''),
                type: project.type || '공장'
              }))
          }
        />
      </Suspense>

      <Suspense fallback={null}>
        <WorkflowModal
          isOpen={modalState.showWorkflowModal}
          onClose={handleWorkflowClose}
          factories={factories}
        />
      </Suspense>

      {modalState.selectedTask && (
        <Suspense fallback={null}>
          <TaskEditModal
            isOpen={modalState.showTaskEditModal}
            onClose={handleTaskEditClose}
            task={modalState.selectedTask}
            onSave={onTaskSave}
            onDelete={onTaskDelete}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <ProductRequestModal
          isOpen={modalState.showProductRequestModal}
          onClose={() => setModalState(prev => ({ ...prev, showProductRequestModal: false }))}
          onSave={handleProductRequestSave}
        />
      </Suspense>

      <Suspense fallback={null}>
        <TaskCreateModal
          isOpen={modalState.showTaskModal}
          onClose={() => setModalState(prev => ({ ...prev, showTaskModal: false, selectedFactoryId: null, selectedDate: null, selectedFactory: null }))}
          onSave={handleTaskCreate}
          availableFactories={projects.map(p => p.name)}
          initialDate={modalState.selectedDate || undefined}
          factoryId={modalState.selectedFactoryId || undefined}
          selectedFactory={modalState.selectedFactory || undefined}
          projectId={projectId}
        />
      </Suspense>

      <Suspense fallback={null}>
        <FactorySelectionModal
          isOpen={modalState.showFactoryModal}
          onClose={() => setModalState(prev => ({ ...prev, showFactoryModal: false }))}
          onSelectFactories={handleFactoriesSelect}
        />
      </Suspense>
    </>
  );
};

export default ScheduleModals;