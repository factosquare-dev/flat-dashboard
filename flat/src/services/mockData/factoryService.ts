/**
 * Factory-related mock data service methods
 */

import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { FACTORY_TYPES, TASK_TYPES } from '@/constants/factory';
import type { Factory } from '@/types/factory';
import type { FactoryId } from '@/types/branded';

export class FactoryDataService {
  private db: MockDatabaseImpl;

  constructor(db: MockDatabaseImpl) {
    this.db = db;
  }

  // 모든 공장 가져오기
  getAllFactories(): Factory[] {
    const database = this.db.getDatabase();
    return Array.from(database.factories.values());
  }

  // 타입별 공장 가져오기
  getFactoriesByType(type: string): Factory[] {
    const factories = this.getAllFactories();
    return factories.filter(f => f.type === type);
  }

  // ID로 공장 가져오기
  getFactoryById(id: string | FactoryId): Factory | undefined {
    const database = this.db.getDatabase();
    return database.factories.get(id);
  }

  // 공장 ID로 태스크 타입 가져오기
  getTaskTypesForFactory(factoryId: string | FactoryId): string[] {
    const factory = this.getFactoryById(factoryId);
    if (!factory) return [];

    // 공장 타입에 따른 태스크 타입 반환
    switch (factory.type) {
      case FACTORY_TYPES.MANUFACTURING:
        return [
          TASK_TYPES.SOURCING,
          TASK_TYPES.PRODUCTION,
          TASK_TYPES.QUALITY_CHECK,
        ];
      case FACTORY_TYPES.CONTAINER:
        return [
          TASK_TYPES.CONTAINER_PRODUCTION,
          TASK_TYPES.CONTAINER_QUALITY_CHECK,
        ];
      case FACTORY_TYPES.PACKAGING:
        return [
          TASK_TYPES.PACKING_DESIGN,
          TASK_TYPES.PACKAGING,
          TASK_TYPES.DELIVERY,
        ];
      default:
        return [];
    }
  }

  // 제조 공장 가져오기
  getManufacturingFactories(): Factory[] {
    return this.getFactoriesByType(FACTORY_TYPES.MANUFACTURING);
  }

  // 용기 공장 가져오기
  getContainerFactories(): Factory[] {
    return this.getFactoriesByType(FACTORY_TYPES.CONTAINER);
  }

  // 포장 공장 가져오기
  getPackagingFactories(): Factory[] {
    return this.getFactoriesByType(FACTORY_TYPES.PACKAGING);
  }
}