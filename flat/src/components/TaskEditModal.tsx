import React, { useState, useEffect } from 'react';
import { Calendar, Building2, CheckSquare } from 'lucide-react';
import BaseModal, { ModalFooter } from './common/BaseModal';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import Button from './common/Button';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: number | string;
    factory?: string;
    task?: string;
    title?: string;
    taskType?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  } | null;
  onSave?: (updatedTask: any) => void;
  onDelete?: (taskId: number | string) => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ isOpen, onClose, task, onSave, onDelete }) => {
  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (task) {
      setTaskName(task.title || task.taskType || task.task || '');
      setStartDate(task.startDate || task.date || '');
      setEndDate(task.endDate || task.date || '');
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...task,
        // Keep the original task name/type unchanged
        date: startDate,
        startDate: startDate,
        endDate: endDate
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && task) {
      onDelete(task.id);
    }
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="태스크 편집"
      size="sm"
      footer={
        <div className="flex justify-between w-full">
          <Button 
            variant="danger"
            onClick={handleDelete}
            size="md"
          >
            삭제
          </Button>
          <ModalFooter>
            <Button 
              variant="secondary"
              onClick={onClose}
              size="md"
            >
              취소
            </Button>
            <Button 
              variant="primary"
              onClick={handleSave}
              size="md"
            >
              저장
            </Button>
          </ModalFooter>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 공장 정보 (읽기 전용) */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Building2 className="icon-md" />
            공장
          </label>
          <div className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-base text-gray-700">
            {task.factory || 'Unknown Factory'}
          </div>
        </div>

        {/* 태스크 이름 (읽기 전용) */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
            <CheckSquare className="icon-md" />
            태스크 이름
          </label>
          <div className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-base text-gray-700">
            {taskName || 'Unknown Task'}
          </div>
        </div>

        {/* 시작 날짜 */}
        <FormInput
          type="date"
          label="시작일"
          value={startDate || ''}
          onChange={(e) => setStartDate(e.target.value)}
          icon={<Calendar className="icon-md" />}
        />

        {/* 종료 날짜 */}
        <FormInput
          type="date"
          label="종료일"
          value={endDate || ''}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
          icon={<Calendar className="icon-md" />}
        />
      </div>
    </BaseModal>
  );
};

export default TaskEditModal;