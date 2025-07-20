import React, { useState } from 'react';
import { factories, taskTypesByFactoryType, getFactoryByName } from '../data/factories';
import BaseModal from './common/BaseModal';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import Button from './common/Button';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { factory: string; taskType: string; startDate: string; endDate: string }) => void;
  availableFactories: string[];
  initialDate?: string;
  projectId?: string;
  selectedFactory?: string;
}

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableFactories,
  initialDate,
  projectId,
  selectedFactory
}) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  
  const [factory, setFactory] = useState('');
  const [taskType, setTaskType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 모달이 열릴 때 날짜 초기화
  React.useEffect(() => {
    if (isOpen) {
      const dateToUse = initialDate || getToday();
      setStartDate(dateToUse);
      setEndDate(dateToUse); // 1일짜리로 설정
    }
  }, [initialDate, isOpen]);
  
  // selectedFactory가 있으면 해당 공장을 자동 선택
  React.useEffect(() => {
    if (selectedFactory && isOpen) {
      setFactory(selectedFactory);
    } else if (projectId && isOpen) {
      const projectFactory = factories.find(f => f.id === projectId);
      if (projectFactory) {
        setFactory(projectFactory.name);
      }
    }
  }, [selectedFactory, projectId, isOpen]);

  // 사용 가능한 공장 목록 필터링
  const availableFactoryList = availableFactories.length > 0 
    ? factories.filter(f => availableFactories.includes(f.name))
    : factories;

  const currentFactory = getFactoryByName(factory);
  const availableTaskTypes = currentFactory 
    ? taskTypesByFactoryType[currentFactory.type] 
    : [];

  const handleSave = () => {
    if (factory && taskType && startDate && endDate) {
      onSave({
        factory,
        taskType,
        startDate,
        endDate
      });
    }
  };
  
  const handleClose = () => {
    // 모달이 닫힐 때만 초기화 (다시 열릴 때 새로운 값으로 설정됨)
    setTimeout(() => {
      setFactory('');
      setTaskType('');
      setStartDate('');
      setEndDate('');
    }, 300);
    onClose();
  };

  const handleFactoryChange = (newFactory: string) => {
    setFactory(newFactory);
    setTaskType(''); // 공장 변경 시 태스크 타입 초기화
  };


  const factoryOptions = availableFactoryList.map(f => ({
    value: f.name,
    label: `${f.name} (${f.type})`
  }));

  const taskTypeOptions = availableTaskTypes.map(type => ({
    value: type,
    label: type
  }));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="태스크 추가"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={!factory || !taskType || !startDate || !endDate}
          >
            추가
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <FormSelect
          label="공장 선택"
          value={factory}
          onChange={(e) => handleFactoryChange(e.target.value)}
          options={factoryOptions}
          placeholder="공장을 선택하세요"
          disabled={!!selectedFactory}
        />

        <FormSelect
          label="태스크 유형"
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          options={taskTypeOptions}
          placeholder={!factory ? '먼저 공장을 선택하세요' : '태스크 유형을 선택하세요'}
          disabled={!factory}
        />

        <FormInput
          type="date"
          label="시작일"
          value={startDate}
          onChange={(e) => {
            const newStartDate = e.target.value;
            setStartDate(newStartDate);
            if (!endDate || endDate < newStartDate) {
              setEndDate(newStartDate);
            }
          }}
        />

        <FormInput
          type="date"
          label="종료일"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
        />
      </div>
    </BaseModal>
  );
};

export default TaskCreateModal;