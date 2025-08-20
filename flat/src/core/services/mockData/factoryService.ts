/**
 * Factory-related mock data service methods
 */

import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { FactoryType, TaskType, TasksByFactoryType } from '@/shared/types/enums';
import type { Factory } from '@/shared/types/factory';
import type { FactoryId } from '@/shared/types/branded';

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
  getTaskTypesForFactory(factoryId: string | FactoryId): TaskType[] {
    const factory = this.getFactoryById(factoryId);
    if (!factory || !factory.type) return [];

    // 공장 타입에 따른 태스크 타입 반환
    return TasksByFactoryType[factory.type as FactoryType] || [];
  }

  // 제조 공장 가져오기
  getManufacturingFactories(): Factory[] {
    return this.getFactoriesByType(FactoryType.MANUFACTURING);
  }

  // 용기 공장 가져오기
  getContainerFactories(): Factory[] {
    return this.getFactoriesByType(FactoryType.CONTAINER);
  }

  // 포장 공장 가져오기
  getPackagingFactories(): Factory[] {
    return this.getFactoriesByType(FactoryType.PACKAGING);
  }
}