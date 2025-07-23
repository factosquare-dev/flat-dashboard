import React, { useState } from 'react';
import { factories, taskTypesByFactoryType, getFactoryByName } from '../data/factories';
import BaseModal from './common/BaseModal';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import { Button } from './ui/Button';
import { formatDateISO } from '../utils/dateUtils';
import { UI_DELAYS } from '../constants/time';
import { useToast } from '../hooks/useToast';

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
  const getToday = () => formatDateISO(new Date());
  const { error: toastError } = useToast();
  
  const [factory, setFactory] = useState('');
  const [taskType, setTaskType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const cleanupTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  // 사용 가능한 공장 목록 필터링
  const availableFactoryList = availableFactories.length > 0 
    ? factories.filter(f => availableFactories.includes(f.name))
    : factories;

  const currentFactory = getFactoryByName(factory);
  const availableTaskTypes = currentFactory 
    ? taskTypesByFactoryType[currentFactory.type] 
    : [];

  const handleSave = () => {
    // Input validation with proper error messages
    if (!factory?.trim()) {
      toastError('공장 선택 오류', '공장을 선택해주세요.');
      return;
    }
    
    if (!taskType?.trim()) {
      toastError('작업 유형 오류', '작업 유형을 선택해주세요.');
      return;
    }
    
    if (!startDate?.trim() || !endDate?.trim()) {
      toastError('날짜 입력 오류', '시작일과 종료일을 모두 입력해주세요.');
      return;
    }
    
    // Validate dates with better error handling
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toastError('날짜 형식 오류', '올바른 날짜 형식이 아닙니다.');
      return;
    }
    
    if (start > end) {
      toastError('날짜 범위 오류', '시작일은 종료일보다 이전이어야 합니다.');
      return;
    }
    
    onSave({
      factory,
      taskType,
      startDate,
      endDate
    });
  };
  
  const handleClose = () => {
    // Clear any existing timeout
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    
    // 모달이 닫힐 때만 초기화 (다시 열릴 때 새로운 값으로 설정됨)
    cleanupTimeoutRef.current = setTimeout(() => {
      setFactory('');
      setTaskType('');
      setStartDate('');
      setEndDate('');
      cleanupTimeoutRef.current = null;
    }, UI_DELAYS.MODAL_CLEANUP);
    onClose();
  };
  
  // 컴포넌트 언마운트 시 cleanup
  React.useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
    };
  }, []);

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