import React, { useReducer, useCallback, useState } from 'react';
import BaseModal, { ModalFooter } from '@/common/BaseModal';
import { FactorySelection } from './FactorySelection';
import { TaskSelection } from './TaskSelection';
import { DateSelection } from './DateSelection';
import { workflowReducer } from './reducer';
import { initialWorkflowState } from './constants';
import { AlertCircle } from 'lucide-react';
import { useModalFormValidation } from '@/hooks/useModalFormValidation';
import { ModalSize, ButtonVariant, ButtonSize } from '@/types/enums';
import { Button } from '@/ui/Button';
import { getModalSizeString } from '@/utils/modalUtils';
import type { WorkflowModalProps } from './types';
import './WorkflowModal.css';

const WorkflowModal: React.FC<WorkflowModalProps> = ({ 
  isOpen, 
  onClose, 
  factories, 
  quickAddData, 
  onSave 
}) => {
  const [state, dispatch] = useReducer(workflowReducer, initialWorkflowState);
  const { 
    selectedFactory, 
    selectedTask, 
    startDate, 
    endDate, 
    showTaskSelection, 
    showTaskDropdown, 
    datePickerType 
  } = state;

  // quickAddData가 변경되면 상태 업데이트
  React.useEffect(() => {
    if (quickAddData) {
      dispatch({ type: 'INITIALIZE_QUICK_ADD', payload: quickAddData });
    } else if (isOpen) {
      // 버튼 클릭으로 열릴 때는 초기화
      dispatch({ type: 'RESET_FORM' });
    }
  }, [quickAddData, isOpen]);

  // Validation rules
  const validationRules = {
    selectedFactory: { required: true },
    selectedTask: { required: true },
    startDate: { required: true },
    endDate: { 
      required: true,
      custom: (value: string) => {
        if (value && state.startDate && value < state.startDate) {
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
    handleFieldChange,
    resetForm,
    isSubmitting
  } = useModalFormValidation(state, {
    rules: validationRules,
    onSubmit: async (data) => {
      if (onSave) {
        onSave({
          factory: data.selectedFactory,
          task: data.selectedTask,
          startDate: data.startDate,
          endDate: data.endDate
        });
      }
      dispatch({ type: 'RESET_FORM' });
      onClose();
    }
  });

  const handleFactorySelect = useCallback((factoryId: string) => {
    dispatch({ type: 'SET_FACTORY', payload: factoryId });
    dispatch({ type: 'SET_TASK', payload: '' }); // 공장 변경 시 태스크 초기화
    dispatch({ type: 'SET_SHOW_TASK_SELECTION', payload: true });
    handleFieldChange('selectedFactory', factoryId);
  }, [handleFieldChange]);

  const handleTaskSelect = useCallback((task: string) => {
    dispatch({ type: 'SET_TASK', payload: task });
    dispatch({ type: 'SET_SHOW_TASK_DROPDOWN', payload: false });
    handleFieldChange('selectedTask', task);
  }, [handleFieldChange]);

  const handleToggleDropdown = useCallback(() => {
    dispatch({ type: 'SET_SHOW_TASK_DROPDOWN', payload: !showTaskDropdown });
  }, [showTaskDropdown]);

  const handleStartDateChange = useCallback((date: string) => {
    dispatch({ type: 'SET_START_DATE', payload: date });
    handleFieldChange('startDate', date);
  }, [handleFieldChange]);

  const handleEndDateChange = useCallback((date: string) => {
    dispatch({ type: 'SET_END_DATE', payload: date });
    handleFieldChange('endDate', date);
  }, [handleFieldChange]);

  const handleSave = useCallback(() => {
    const form = formRef.current;
    if (form) {
      form.requestSubmit();
    }
  }, [formRef]);

  const handleCancel = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="워크플로우 추가"
      size={getModalSizeString(ModalSize.MD)}
      footer={
        <ModalFooter>
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MD}
            onClick={handleCancel}
          >
            취소
          </Button>
          <Button
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.MD}
            onClick={handleSave}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            저장
          </Button>
        </ModalFooter>
      }
    >
      <form ref={formRef} onSubmit={handleFormSubmit} className="bg-gray-50 -mx-6 -my-6 px-6 py-6">
        <div className="modal-section-spacing">
        {/* Validation error message */}
        {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
          <div className="workflow-modal__error">
            <AlertCircle className="workflow-modal__error-icon" />
            <span>공장, 태스크, 날짜를 모두 선택해주세요</span>
          </div>
        )}
        {/* 공장 선택 */}
        <FactorySelection
          factories={factories}
          selectedFactory={selectedFactory}
          onFactorySelect={handleFactorySelect}
        />

        {/* 태스크 선택 & 날짜 선택 - 공장 선택 후 표시 */}
        {showTaskSelection && (
          <>
            <TaskSelection
              selectedFactory={selectedFactory}
              selectedTask={selectedTask}
              showTaskDropdown={showTaskDropdown}
              onTaskSelect={handleTaskSelect}
              onToggleDropdown={handleToggleDropdown}
            />

            <DateSelection
              startDate={startDate}
              endDate={endDate}
              quickAddData={quickAddData}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
            />
          </>
        )}
        </div>
      </form>
    </BaseModal>
  );
};

export default React.memo(WorkflowModal);