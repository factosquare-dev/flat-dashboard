import React, { useReducer, useCallback } from 'react';
import BaseModal from '../common/BaseModal';
import { Button } from '../ui/Button';
import { FactorySelection } from './FactorySelection';
import { TaskSelection } from './TaskSelection';
import { DateSelection } from './DateSelection';
import { workflowReducer } from './reducer';
import { initialWorkflowState } from './constants';
import type { WorkflowModalProps } from './types';

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

  const handleFactorySelect = useCallback((factoryName: string) => {
    dispatch({ type: 'SET_FACTORY', payload: factoryName });
    dispatch({ type: 'SET_TASK', payload: '' }); // 공장 변경 시 태스크 초기화
    dispatch({ type: 'SET_SHOW_TASK_SELECTION', payload: true });
  }, []);

  const handleTaskSelect = useCallback((task: string) => {
    dispatch({ type: 'SET_TASK', payload: task });
    dispatch({ type: 'SET_SHOW_TASK_DROPDOWN', payload: false });
  }, []);

  const handleToggleDropdown = useCallback(() => {
    dispatch({ type: 'SET_SHOW_TASK_DROPDOWN', payload: !showTaskDropdown });
  }, [showTaskDropdown]);

  const handleStartDateChange = useCallback((date: string) => {
    dispatch({ type: 'SET_START_DATE', payload: date });
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    dispatch({ type: 'SET_END_DATE', payload: date });
  }, []);

  const handleSave = useCallback(() => {
    if (onSave && selectedFactory && selectedTask && startDate && endDate) {
      onSave({
        factory: selectedFactory,
        task: selectedTask,
        startDate: startDate,
        endDate: endDate
      });
    }
    dispatch({ type: 'RESET_FORM' });
    onClose();
  }, [onSave, selectedFactory, selectedTask, startDate, endDate, onClose]);

  const handleCancel = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
    onClose();
  }, [onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="워크플로우 추가"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
          <Button 
            variant="primary"
            onClick={handleSave}
            disabled={!selectedFactory || !selectedTask || !startDate || !endDate}
          >
            저장
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
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
    </BaseModal>
  );
};

export default WorkflowModal;