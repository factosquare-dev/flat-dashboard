/**
 * Drag validation utilities for useTaskDrag
 */

import type { Task, Participant } from '../../../../types/schedule';
import { findAvailableDateRange } from '../../../../utils/taskUtils';
import { factories } from '../../../../data/factories';

export const validateFactoryCompatibility = (
  task: Task,
  targetFactory: string,
  projects: Participant[]
): { isCompatible: boolean; reason?: string } => {
  const taskFactory = task.factory;
  
  if (!taskFactory || !targetFactory) {
    return { isCompatible: true };
  }
  
  // Find factory objects
  const sourceFactory = factories.find(f => f.name === taskFactory);
  const targetFactoryObj = factories.find(f => f.name === targetFactory);
  
  if (!sourceFactory || !targetFactoryObj) {
    return { 
      isCompatible: false, 
      reason: '팩토리 정보를 찾을 수 없습니다.' 
    };
  }
  
  // Check type compatibility
  const isTypeCompatible = sourceFactory.type === targetFactoryObj.type;
  
  if (!isTypeCompatible) {
    return {
      isCompatible: false,
      reason: `팩토리 타입이 호환되지 않습니다. (${sourceFactory.type} → ${targetFactoryObj.type})`
    };
  }
  
  // Check capacity constraints (if applicable)
  const targetProject = projects.find(p => p.name === targetFactory);
  if (targetProject) {
    // Add capacity validation logic here if needed
    // For now, just return compatible
    return { isCompatible: true };
  }
  
  return { isCompatible: true };
};

export const validateDateRange = (
  startDate: string,
  endDate: string,
  targetFactory: string,
  task: Task,
  projects: Participant[]
): { isValid: boolean; reason?: string } => {
  const targetProject = projects.find(p => p.name === targetFactory);
  
  if (!targetProject) {
    return { isValid: false, reason: '대상 프로젝트를 찾을 수 없습니다.' };
  }
  
  // Find available date range for the target factory
  const availableRange = findAvailableDateRange(
    targetProject,
    new Date(startDate),
    new Date(endDate),
    task.id
  );
  
  if (!availableRange) {
    return { 
      isValid: false, 
      reason: '선택한 기간에 사용 가능한 시간이 없습니다.' 
    };
  }
  
  const requestedStart = new Date(startDate);
  const requestedEnd = new Date(endDate);
  
  // Check if requested dates fit within available range
  if (requestedStart < availableRange.start || requestedEnd > availableRange.end) {
    return {
      isValid: false,
      reason: `사용 가능한 기간: ${availableRange.start.toLocaleDateString('ko-KR')} ~ ${availableRange.end.toLocaleDateString('ko-KR')}`
    };
  }
  
  return { isValid: true };
};

export const validateTaskDrop = (
  task: Task,
  targetFactory: string,
  startDate: string,
  endDate: string,
  projects: Participant[]
): { isValid: boolean; reason?: string } => {
  // Validate factory compatibility
  const factoryValidation = validateFactoryCompatibility(task, targetFactory, projects);
  if (!factoryValidation.isCompatible) {
    return { isValid: false, reason: factoryValidation.reason };
  }
  
  // Validate date range
  const dateValidation = validateDateRange(startDate, endDate, targetFactory, task, projects);
  if (!dateValidation.isValid) {
    return { isValid: false, reason: dateValidation.reason };
  }
  
  // Additional validation rules can be added here
  
  return { isValid: true };
};

export const getDropFeedback = (
  task: Task,
  targetFactory: string,
  projects: Participant[]
): { canDrop: boolean; message?: string; style?: string } => {
  const validation = validateFactoryCompatibility(task, targetFactory, projects);
  
  if (!validation.isCompatible) {
    return {
      canDrop: false,
      message: validation.reason,
      style: 'border-red-400 bg-red-50'
    };
  }
  
  return {
    canDrop: true,
    message: '여기에 드롭할 수 있습니다.',
    style: 'border-green-400 bg-green-50'
  };
};