import React from 'react';
import BaseModal from '@/common/BaseModal';
import { Button } from '@/ui/Button';
import { TaskFormFields } from './TaskFormFields';
import { useTaskCreateForm } from '@/hooks/useTaskCreateForm';
import { ModalSize, ButtonVariant, ButtonSize } from '@/types/enums';
import { FactoryId, ProjectId } from '@/types/branded';
import '../TaskCreateModal.css';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { factory: string; factoryId: FactoryId; taskType: string; startDate: string; endDate: string }) => void;
  availableFactories: FactoryId[];
  initialDate?: string;
  projectId?: ProjectId;
  factoryId?: FactoryId;
  selectedFactory?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  existingTasks?: { factory: string; factoryId?: FactoryId; startDate: string; endDate: string; }[];
}

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableFactories,
  initialDate,
  projectId,
  factoryId: propFactoryId,
  selectedFactory,
  projectStartDate,
  projectEndDate,
  existingTasks = []
}) => {
  const {
    formData,
    setters,
    handlers,
    validationError,
    setValidationError
  } = useTaskCreateForm({
    isOpen,
    initialDate,
    propFactoryId,
    selectedFactory,
    projectStartDate,
    projectEndDate,
    existingTasks,
    onSave,
    onClose
  });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handlers.handleClose}
      title="새 작업 추가"
      size={ModalSize.SMALL}
    >
      <TaskFormFields
        factoryId={formData.factoryId}
        taskType={formData.taskType}
        startDate={formData.startDate}
        endDate={formData.endDate}
        availableFactories={availableFactories}
        selectedFactory={selectedFactory}
        existingTasks={existingTasks}
        validationError={validationError}
        onFactoryChange={handlers.handleFactoryChange}
        onTaskTypeChange={(e) => setters.setTaskType(e.target.value)}
        onStartDateChange={handlers.handleStartDateChange}
        onEndDateChange={(e) => setters.setEndDate(e.target.value)}
        onValidationErrorDismiss={() => setValidationError(null)}
      />
      
      <div className="modal-footer">
        <Button
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.MEDIUM}
          onClick={handlers.handleClose}
        >
          취소
        </Button>
        <Button
          variant={ButtonVariant.PRIMARY}
          size={ButtonSize.MEDIUM}
          onClick={handlers.handleSave}
          disabled={!formData.factoryId || !formData.taskType || !formData.startDate || !formData.endDate}
        >
          저장
        </Button>
      </div>
    </BaseModal>
  );
};

export default TaskCreateModal;