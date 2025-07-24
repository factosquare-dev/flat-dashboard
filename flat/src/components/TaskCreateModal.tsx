import React, { useState, useCallback, useMemo } from 'react';
import { factories, taskTypesByFactoryType, getFactoryByName } from '../data/factories';
import BaseModal from './common/BaseModal';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';
import { Button } from './ui/Button';
import { formatDateISO } from '../utils/dateUtils';
import { UI_DELAYS } from '../constants/time';
import { useToast } from '../hooks/useToast';
import { validateTask, TASK_CONSTRAINTS, dateUtils } from '../utils/taskValidation';
import { mockDataService } from '../services/mockDataService';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { factory: string; factoryId: string; taskType: string; startDate: string; endDate: string }) => void;
  availableFactories: string[];
  initialDate?: string;
  projectId?: string;
  selectedFactory?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  existingTasks?: { factory: string; factoryId?: string; startDate: string; endDate: string; }[];
}

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableFactories,
  initialDate,
  projectId,
  selectedFactory,
  projectStartDate,
  projectEndDate,
  existingTasks = []
}) => {
  const getToday = () => formatDateISO(new Date());
  const { error: toastError } = useToast();
  
  const [factoryId, setFactoryId] = useState('');
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
      // selectedFactory가 이름인 경우 ID로 변환
      const factory = mockDataService.getAllFactories().find(f => f.name === selectedFactory);
      setFactoryId(factory?.id || '');
    } else if (projectId && isOpen) {
      const projectFactory = factories.find(f => f.id === projectId);
      if (projectFactory) {
        setFactoryId(projectFactory.id);
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
  const availableFactoryList = useMemo(() => 
    availableFactories.length > 0 
      ? factories.filter(f => availableFactories.includes(f.name))
      : factories,
    [availableFactories]
  );

  const currentFactory = useMemo(() => 
    mockDataService.getAllFactories().find(f => f.id === factoryId),
    [factoryId]
  );
  
  const availableTaskTypes = useMemo(() => 
    currentFactory ? taskTypesByFactoryType[currentFactory.type] : [],
    [currentFactory]
  );

  const handleSave = useCallback(() => {
    // Input validation with proper error messages
    if (!factoryId?.trim()) {
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
    
    const selectedFactory = mockDataService.getAllFactories().find(f => f.id === factoryId);
    if (!selectedFactory) {
      toastError('공장 선택 오류', '유효하지 않은 공장입니다.');
      return;
    }
    
    // Create temporary task for validation
    const newTask = {
      id: 0, // Temporary ID
      factory: selectedFactory.name,
      factoryId: selectedFactory.id,
      taskType,
      startDate,
      endDate,
      color: 'blue',
      status: 'pending' as const,
      projectId: projectId || ''
    };
    
    // Validate the task using our validation utilities
    const taskValidation = validateTask(newTask, projectStartDate, projectEndDate);
    if (!taskValidation.isValid) {
      const errorMessage = taskValidation.errors.map(error => error.message).join('\n');
      toastError('태스크 유효성 검증 실패', errorMessage);
      return;
    }
    
    // Check for overlaps with existing tasks in the same factory
    const sameFactoryTasks = existingTasks.filter(task => 
      (task.factoryId && task.factoryId === factoryId) || 
      (!task.factoryId && task.factory === selectedFactory.name)
    );
    const hasOverlap = sameFactoryTasks.some(task => 
      dateUtils.dateRangesOverlap(startDate, endDate, task.startDate, task.endDate)
    );
    
    if (hasOverlap) {
      toastError('태스크 겹침 오류', `${selectedFactory.name}에서 해당 기간에 이미 진행 중인 태스크가 있습니다.`);
      return;
    }
    
    // Additional validation: Check task duration
    const duration = dateUtils.getDaysBetween(startDate, endDate);
    if (duration < TASK_CONSTRAINTS.MIN_TASK_DURATION_DAYS) {
      toastError('태스크 기간 오류', `태스크 기간은 최소 ${TASK_CONSTRAINTS.MIN_TASK_DURATION_DAYS}일 이상이어야 합니다.`);
      return;
    }
    
    if (duration > TASK_CONSTRAINTS.MAX_TASK_DURATION_DAYS) {
      toastError('태스크 기간 오류', `태스크 기간은 최대 ${TASK_CONSTRAINTS.MAX_TASK_DURATION_DAYS}일을 초과할 수 없습니다.`);
      return;
    }
    
    onSave({
      factory: selectedFactory.name,
      factoryId: selectedFactory.id,
      taskType,
      startDate,
      endDate
    });
  }, [factoryId, taskType, startDate, endDate, onSave, toastError, projectStartDate, projectEndDate, projectId, existingTasks, mockDataService]);
  
  const handleClose = useCallback(() => {
    // Clear any existing timeout
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    
    // 모달이 닫힐 때만 초기화 (다시 열릴 때 새로운 값으로 설정됨)
    cleanupTimeoutRef.current = setTimeout(() => {
      setFactoryId('');
      setTaskType('');
      setStartDate('');
      setEndDate('');
      cleanupTimeoutRef.current = null;
    }, UI_DELAYS.MODAL_CLEANUP);
    onClose();
  }, [onClose]);
  
  // 컴포넌트 언마운트 시 cleanup
  React.useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
    };
  }, []);

  const handleFactoryChange = useCallback((newFactoryId: string) => {
    setFactoryId(newFactoryId);
    setTaskType(''); // 공장 변경 시 태스크 타입 초기화
  }, []);


  const factoryOptions = useMemo(() => 
    availableFactoryList.map(f => ({
      value: f.id,
      label: `${f.name} (${f.type})`
    })), 
    [availableFactoryList]
  );

  const taskTypeOptions = useMemo(() => 
    availableTaskTypes.map(type => ({
      value: type,
      label: type
    })), 
    [availableTaskTypes]
  );

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
            disabled={!factoryId || !taskType || !startDate || !endDate}
          >
            추가
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <FormSelect
          label="공장 선택"
          value={factoryId}
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
          placeholder={!factoryId ? '먼저 공장을 선택하세요' : '태스크 유형을 선택하세요'}
          disabled={!factoryId}
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
          min={projectStartDate}
          max={projectEndDate}
        />

        <FormInput
          type="date"
          label="종료일"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
          max={projectEndDate}
        />
        
        {/* Task constraints info */}
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
          <div className="font-medium mb-1">태스크 제약사항</div>
          <ul className="space-y-1 text-xs">
            <li>• 태스크 기간: {TASK_CONSTRAINTS.MIN_TASK_DURATION_DAYS}일 ~ {TASK_CONSTRAINTS.MAX_TASK_DURATION_DAYS}일</li>
            <li>• 같은 공장에서는 동시에 하나의 태스크만 진행 가능</li>
            <li>• 태스크는 프로젝트 기간 내에서만 생성 가능</li>
          </ul>
        </div>
      </div>
    </BaseModal>
  );
};

export default React.memo(TaskCreateModal);