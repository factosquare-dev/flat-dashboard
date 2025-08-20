import React from 'react';
import { AlertCircle } from 'lucide-react';
import { TaskCreateModalService } from '@/core/services/taskCreateModal.service';
import { FactoryId } from '@/shared/types/branded';

interface TaskFormFieldsProps {
  factoryId: string;
  taskType: string;
  startDate: string;
  endDate: string;
  availableFactories: FactoryId[];
  selectedFactory?: string;
  existingTasks?: { factory: string; factoryId?: FactoryId; startDate: string; endDate: string; }[];
  validationError: string | null;
  onFactoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTaskTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidationErrorDismiss: () => void;
}

export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  factoryId,
  taskType,
  startDate,
  endDate,
  availableFactories,
  selectedFactory,
  existingTasks = [],
  validationError,
  onFactoryChange,
  onTaskTypeChange,
  onStartDateChange,
  onEndDateChange,
  onValidationErrorDismiss
}) => {
  const factoryOptions = TaskCreateModalService.getAvailableFactoriesOptions(
    availableFactories,
    selectedFactory,
    existingTasks
  );

  const taskTypeOptions = TaskCreateModalService.getTaskTypesForFactory(factoryId);

  return (
    <div className="task-create-form">
      {/* Validation Error Message */}
      {validationError && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700 whitespace-pre-line">{validationError}</p>
          </div>
          <button
            onClick={onValidationErrorDismiss}
            className="text-red-600 hover:text-red-800"
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      {/* Factory Selection */}
      <div className="form-group">
        <label className="form-label">공장 <span className="required">*</span></label>
        <select
          className="form-select"
          value={factoryId}
          onChange={onFactoryChange}
          required
        >
          <option value="">공장을 선택하세요</option>
          {factoryOptions.map(option => option && (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Task Type Selection */}
      <div className="form-group">
        <label className="form-label">작업 타입 <span className="required">*</span></label>
        <select
          className="form-select"
          value={taskType}
          onChange={onTaskTypeChange}
          disabled={!factoryId}
          required
        >
          <option value="">작업 타입을 선택하세요</option>
          {taskTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {!factoryId && (
          <p className="mt-1 text-sm text-gray-500">먼저 공장을 선택하세요</p>
        )}
      </div>

      {/* Date Selection */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">시작일 <span className="required">*</span></label>
          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={onStartDateChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">종료일 <span className="required">*</span></label>
          <input
            type="date"
            className="form-input"
            value={endDate}
            onChange={onEndDateChange}
            min={startDate}
            required
          />
        </div>
      </div>
    </div>
  );
};