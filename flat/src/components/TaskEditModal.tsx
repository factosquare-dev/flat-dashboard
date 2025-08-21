import React, { useState, useEffect, useCallback, memo } from 'react';
import { Calendar, Building2, CheckSquare } from 'lucide-react';
import BaseModal, { ModalFooter } from './common/BaseModal';
import { MODAL_SIZES } from '@/shared/utils/modalUtils';
import { ButtonVariant } from '@/shared/types/enums';
import { Button } from './ui/Button';

interface Task {
  id: number | string;
  factory?: string;
  task?: string;
  title?: string;
  taskType?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave?: (updatedTask: Task) => void;
  onDelete?: (taskId: number | string) => void;
}

const TaskEditModalComponent: React.FC<TaskEditModalProps> = ({ isOpen, onClose, task, onSave, onDelete }) => {
  const taskName = task?.title || task?.taskType || task?.task || '';
  const [startDate, setStartDate] = useState(task?.startDate || task?.date || '');
  const [endDate, setEndDate] = useState(task?.endDate || task?.date || '');

  useEffect(() => {
    if (task) {
      setStartDate(task.startDate || task.date || '');
      setEndDate(task.endDate || task.date || '');
    }
  }, [task]);

  const handleSave = useCallback(() => {
    if (onSave && task) {
      onSave({
        ...task,
        // Keep the original task name/type unchanged
        date: startDate,
        startDate: startDate,
        endDate: endDate
      });
    }
    onClose();
  }, [onSave, task, startDate, endDate, onClose]);

  const handleDelete = useCallback(() => {
    if (onDelete && task) {
      onDelete(task.id);
    }
    onClose();
  }, [onDelete, task, onClose]);

  if (!task) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="태스크 편집"
      size={MODAL_SIZES.SMALL}
      footer={
        <div className="flex justify-between w-full">
          <Button
            variant={ButtonVariant.DANGER}
            onClick={handleDelete}
          >
            삭제
          </Button>
          <div className="flex gap-3">
            <Button
              variant={ButtonVariant.SECONDARY}
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              variant={ButtonVariant.PRIMARY}
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        </div>
      }
    >
      <div className="modal-section-spacing">
        {/* 공장 정보 (읽기 전용) */}
        <div className="modal-field-spacing">
          <div className="modal-field-label">
            <Building2 />
            공장
          </div>
          <div className="modal-input bg-gray-100 text-gray-700">
            {task.factory || 'Unknown Factory'}
          </div>
        </div>

        {/* 태스크 이름 (읽기 전용) */}
        <div className="modal-field-spacing">
          <div className="modal-field-label">
            <CheckSquare />
            태스크 이름
          </div>
          <div className="modal-input bg-gray-100 text-gray-700">
            {taskName || 'Unknown Task'}
          </div>
        </div>

        {/* 날짜 입력 */}
        <div className="modal-grid-2">
          <div className="modal-field-spacing">
            <div className="modal-field-label">
              <Calendar />
              시작일
            </div>
            <input
              type="date"
              className="modal-input"
              value={startDate || ''}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="modal-field-spacing">
            <div className="modal-field-label">
              <Calendar />
              종료일
            </div>
            <input
              type="date"
              className="modal-input"
              value={endDate || ''}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

const TaskEditModal = memo(TaskEditModalComponent);

export default TaskEditModal;