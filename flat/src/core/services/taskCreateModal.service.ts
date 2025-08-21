import { formatDateISO } from '@/shared/utils/coreUtils';
import { validateTask, dateUtils } from '@/shared/utils/taskValidation';
import { FactoryId } from '@/shared/types/branded';
import { getFactoryByIdSafe } from '@/shared/utils/factoryUtils';
import { factories, taskTypesByFactoryType } from '@/core/database/factories';

interface ExistingTask {
  factory: string;
  factoryId?: FactoryId;
  startDate: string;
  endDate: string;
}

export class TaskCreateModalService {
  /**
   * Get today's date in ISO format
   */
  static getToday(): string {
    return formatDateISO(new Date());
  }

  /**
   * Get available factories excluding already used ones
   */
  static getAvailableFactoriesOptions(
    availableFactories: FactoryId[],
    selectedFactory?: string,
    existingTasks: ExistingTask[] = []
  ) {
    const usedFactoryIds = existingTasks
      .map(task => task.factoryId || task.factory)
      .filter(Boolean);

    return availableFactories
      .filter(id => {
        if (selectedFactory && id === selectedFactory) return true;
        return !usedFactoryIds.includes(id);
      })
      .map(id => {
        const factory = getFactoryByIdSafe(id);
        return factory ? { value: id, label: factory.name } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a?.label || '').localeCompare(b?.label || ''));
  }

  /**
   * Get task types for a specific factory
   */
  static getTaskTypesForFactory(factoryId: string) {
    const factory = getFactoryByIdSafe(factoryId as FactoryId);
    if (!factory) return [];

    const factoryTypeMap = taskTypesByFactoryType[factory.type];
    if (!factoryTypeMap) return [];

    return Object.entries(factoryTypeMap).map(([value, label]) => ({
      value,
      label
    }));
  }

  /**
   * Validate task data
   */
  static validateTaskData(
    factoryId: string,
    taskType: string,
    startDate: string,
    endDate: string,
    projectStartDate?: string,
    projectEndDate?: string,
    existingTasks: ExistingTask[] = []
  ): string | null {
    if (!factoryId || !taskType || !startDate || !endDate) {
      return '모든 필드를 입력해주세요';
    }

    const validation = validateTask(
      { factory: factoryId, taskType, startDate, endDate },
      projectStartDate || this.getToday(),
      projectEndDate || dateUtils.addDays(this.getToday(), 365),
      existingTasks
    );

    if (!validation.isValid && validation.errors.length > 0) {
      return validation.errors.join('\n');
    }

    return null;
  }

  /**
   * Calculate recommended end date based on start date
   */
  static calculateRecommendedEndDate(startDate: string, duration: number = 1): string {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration - 1);
    
    return formatDateISO(end);
  }

  /**
   * Get initial form data
   */
  static getInitialFormData(
    initialDate?: string,
    propFactoryId?: FactoryId,
    selectedFactory?: string
  ) {
    const today = this.getToday();
    const dateToUse = initialDate || today;
    
    return {
      factoryId: propFactoryId || selectedFactory || '',
      taskType: '',
      startDate: dateToUse,
      endDate: dateToUse
    };
  }
}