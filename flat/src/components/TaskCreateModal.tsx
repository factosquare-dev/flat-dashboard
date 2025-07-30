import React, { useState, useCallback, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { factories, taskTypesByFactoryType } from '../data/factories';
import BaseModal from './common/BaseModal';
import { formatDateISO } from '../utils/coreUtils';
import { UI_DELAYS } from '../constants/time';
import { useToast } from '../hooks/useToast';
import { validateTask, TASK_CONSTRAINTS, dateUtils } from '../utils/taskValidation';
import { mockDataService } from '../services/mockDataService';
import { TaskStatus, ModalSize, ButtonVariant, ButtonSize } from '../types/enums';
import { getFactoryByIdSafe, getFactoryByIdOrName } from '../utils/factoryUtils';
import { MODAL_SIZES } from '../utils/modalUtils';
import { Button } from './ui/Button';
import './TaskCreateModal.css';
import { FactoryId, ProjectId, toFactoryId, toFactoryIdSafe, extractIdString } from '../types/branded';

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
  const getToday = () => formatDateISO(new Date());
  const { error: toastError } = useToast();
  
  const [factoryId, setFactoryId] = useState('');
  const [taskType, setTaskType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const cleanupTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // 모달이 열릴 때 날짜 초기화
  React.useEffect(() => {
    if (isOpen) {
      const dateToUse = initialDate || getToday();
      setStartDate(dateToUse);
      setEndDate(dateToUse); // 1일짜리로 설정
    }
  }, [initialDate, isOpen]);
  
  // selectedFactory가 있으면 해당 공장을 자동 선택 - ID/이름 둘 다 지원
  React.useEffect(() => {
    if (selectedFactory && isOpen) {
      const allFactories = mockDataService.getAllFactories();
      const factory = getFactoryByIdOrName(allFactories, selectedFactory);
      setFactoryId(factory?.id || '');
    } else if (propFactoryId && isOpen) {
      // propFactoryId가 있으면 직접 사용
      setFactoryId(extractIdString(propFactoryId));
    }
  }, [selectedFactory, propFactoryId, isOpen]);
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  // 사용 가능한 공장 목록 필터링 - ID 기반으로 변경
  const availableFactoryList = useMemo(() => {
    if (availableFactories.length > 0) {
      // availableFactories가 이름 배열인 경우 ID로 변환하여 필터링
      return factories.filter(f => {
        // availableFactories가 ID인지 이름인지 확인
        const hasId = availableFactories.some(af => factories.some(factory => factory.id === af));
        return hasId ? availableFactories.includes(f.id) : availableFactories.includes(f.name);
      });
    }
    return factories;
  }, [availableFactories]);

  const currentFactory = useMemo(() => 
    mockDataService.getAllFactories().find(f => f.id === factoryId),
    [factoryId]
  );
  
  const availableTaskTypes = useMemo(() => 
    currentFactory ? taskTypesByFactoryType[currentFactory.type] : [],
    [currentFactory]
  );

  const handleSave = useCallback(() => {
    // Reset validation error
    setValidationError(null);
    
    // Input validation with proper error messages
    if (!factoryId?.trim()) {
      setValidationError('공장을 선택해주세요.');
      return;
    }
    
    if (!taskType?.trim()) {
      setValidationError('작업 유형을 선택해주세요.');
      return;
    }
    
    if (!startDate?.trim() || !endDate?.trim()) {
      setValidationError('시작일과 종료일을 모두 입력해주세요.');
      return;
    }
    
    const selectedFactory = mockDataService.getAllFactories().find(f => f.id === factoryId);
    if (!selectedFactory) {
      setValidationError('유효하지 않은 공장입니다.');
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
      status: TaskStatus.PENDING,
      projectId: projectId || ''
    };
    
    // Validate the task using our validation utilities
    const taskValidation = validateTask(newTask, projectStartDate, projectEndDate);
    if (!taskValidation.isValid) {
      const errorMessage = taskValidation.errors.map(error => error.message).join(', ');
      setValidationError(errorMessage);
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
      setValidationError(`${selectedFactory.name}에서 해당 기간에 이미 진행 중인 태스크가 있습니다.`);
      return;
    }
    
    // Additional validation: Check task duration
    const duration = dateUtils.getDaysBetween(startDate, endDate);
    if (duration < TASK_CONSTRAINTS.MIN_TASK_DURATION_DAYS) {
      setValidationError(`태스크 기간은 최소 ${TASK_CONSTRAINTS.MIN_TASK_DURATION_DAYS}일 이상이어야 합니다.`);
      return;
    }
    
    if (duration > TASK_CONSTRAINTS.MAX_TASK_DURATION_DAYS) {
      setValidationError(`태스크 기간은 최대 ${TASK_CONSTRAINTS.MAX_TASK_DURATION_DAYS}일을 초과할 수 없습니다.`);
      return;
    }
    
    onSave({
      factory: selectedFactory.name,
      factoryId: selectedFactory.id,
      taskType,
      startDate,
      endDate
    });
  }, [factoryId, taskType, startDate, endDate, onSave, projectStartDate, projectEndDate, projectId, existingTasks]);
  
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
      setValidationError(null);
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
    setValidationError(null); // 입력 변경 시 에러 초기화
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
      size={MODAL_SIZES.SMALL}
      footer={
        <div className="modal-footer__actions">
          <Button 
            variant={ButtonVariant.SECONDARY}
            onClick={onClose}
          >
            취소
          </Button>
          <Button 
            variant={ButtonVariant.PRIMARY}
            onClick={handleSave}
            disabled={!factoryId || !taskType || !startDate || !endDate}
          >
            추가
          </Button>
        </div>
      }
    >
      <div className="modal-section-spacing">
        {/* Validation error message */}
        {validationError && (
          <div className="task-modal__error">
            <AlertCircle className="task-modal__error-icon" />
            <span>{validationError}</span>
          </div>
        )}
        
        <div className="modal-field-spacing">
          <label className="modal-field-label">공장 선택</label>
          <select
            className="modal-input cursor-pointer"
            value={factoryId}
            onChange={(e) => handleFactoryChange(e.target.value)}
            disabled={!!selectedFactory}
          >
            <option value="">공장을 선택하세요</option>
            {factoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field-spacing">
          <label className="modal-field-label">태스크 유형</label>
          <select
            className="modal-input cursor-pointer"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            disabled={!factoryId}
          >
            <option value="">
              {!factoryId ? '먼저 공장을 선택하세요' : '태스크 유형을 선택하세요'}
            </option>
            {taskTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-grid-2">
          <div className="modal-field-spacing">
            <label className="modal-field-label">시작일</label>
            <input
              type="date"
              className="modal-input"
              value={startDate}
              onChange={(e) => {
                const newStartDate = e.target.value;
                setStartDate(newStartDate);
                setValidationError(null);
                if (!endDate || endDate < newStartDate) {
                  setEndDate(newStartDate);
                }
              }}
              min={projectStartDate}
              max={projectEndDate}
            />
          </div>

          <div className="modal-field-spacing">
            <label className="modal-field-label">종료일</label>
            <input
              type="date"
              className="modal-input"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setValidationError(null);
              }}
              min={startDate}
              max={projectEndDate}
            />
          </div>
        </div>
        
        {/* Task constraints info */}
        <div className="task-modal__constraints">
          <div className="task-modal__constraints-title">태스크 제약사항</div>
          <ul className="task-modal__constraints-list">
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