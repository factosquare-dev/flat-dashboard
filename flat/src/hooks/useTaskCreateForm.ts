import { useState, useCallback, useRef, useEffect } from 'react';
import { TaskCreateModalService } from '../services/taskCreateModal.service';
import { UI_DELAYS } from '../constants/time';
import { useToast } from './useToast';
import { FactoryId } from '../types/branded';

interface UseTaskCreateFormProps {
  isOpen: boolean;
  initialDate?: string;
  propFactoryId?: FactoryId;
  selectedFactory?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  existingTasks?: { factory: string; factoryId?: FactoryId; startDate: string; endDate: string; }[];
  onSave: (task: { factory: string; factoryId: FactoryId; taskType: string; startDate: string; endDate: string }) => void;
  onClose: () => void;
}

export const useTaskCreateForm = ({
  isOpen,
  initialDate,
  propFactoryId,
  selectedFactory,
  projectStartDate,
  projectEndDate,
  existingTasks = [],
  onSave,
  onClose
}: UseTaskCreateFormProps) => {
  const { error: toastError } = useToast();
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [factoryId, setFactoryId] = useState('');
  const [taskType, setTaskType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialData = TaskCreateModalService.getInitialFormData(
        initialDate,
        propFactoryId,
        selectedFactory
      );
      setFactoryId(initialData.factoryId);
      setTaskType(initialData.taskType);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
    }
  }, [isOpen, initialDate, propFactoryId, selectedFactory]);

  // Initialize factory when prop changes
  useEffect(() => {
    if (propFactoryId) {
      setFactoryId(propFactoryId);
      setTaskType('');
    }
  }, [propFactoryId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  const handleFactoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFactoryId(e.target.value);
    setTaskType('');
    setValidationError(null);
  }, []);

  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Auto-adjust end date if needed
    if (newStartDate && endDate && newStartDate > endDate) {
      setEndDate(newStartDate);
    }
    setValidationError(null);
  }, [endDate]);

  const handleSave = useCallback(() => {
    const error = TaskCreateModalService.validateTaskData(
      factoryId,
      taskType,
      startDate,
      endDate,
      projectStartDate,
      projectEndDate,
      existingTasks
    );

    if (error) {
      setValidationError(error);
      return;
    }

    onSave({
      factory: factoryId,
      factoryId: factoryId as FactoryId,
      taskType,
      startDate,
      endDate
    });

    // Reset form after delay
    cleanupTimeoutRef.current = setTimeout(() => {
      setFactoryId('');
      setTaskType('');
      setStartDate('');
      setEndDate('');
      setValidationError(null);
    }, UI_DELAYS.modalTransition);
  }, [factoryId, taskType, startDate, endDate, projectStartDate, projectEndDate, existingTasks, onSave]);

  const handleClose = useCallback(() => {
    setValidationError(null);
    onClose();
    
    // Reset form after modal closes
    cleanupTimeoutRef.current = setTimeout(() => {
      setFactoryId('');
      setTaskType('');
      setStartDate('');
      setEndDate('');
    }, UI_DELAYS.modalTransition);
  }, [onClose]);

  return {
    formData: {
      factoryId,
      taskType,
      startDate,
      endDate
    },
    setters: {
      setFactoryId,
      setTaskType,
      setStartDate,
      setEndDate
    },
    handlers: {
      handleFactoryChange,
      handleStartDateChange,
      handleSave,
      handleClose
    },
    validationError,
    setValidationError
  };
};