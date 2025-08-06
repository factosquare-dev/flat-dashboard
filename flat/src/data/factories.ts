import { FACTORY_TYPES, TASK_TYPES } from '../constants/factory';
import { FactoryType } from '../types/enums';
import { FactoryId, toFactoryId } from '../types/branded';

// 공장 인증 타입
export type CertificationType = 
  | 'ISO 22716'  // 화장품 GMP
  | 'CGMP'       // 화장품 우수제조관리기준
  | 'ISO 9001'   // 품질경영시스템
  | 'ISO 14001'  // 환경경영시스템
  | 'ISO 45001'  // 안전보건경영시스템
  | 'FSC'        // 산림관리협의회 인증
  | 'VEGAN'      // 비건 인증
  | 'HALAL'      // 할랄 인증
  | 'EWG'        // EWG 인증
  | 'COSMOS'     // 유기농 화장품 인증
  | 'ECOCERT';   // 에코서트 인증

export interface FactoryManager {
  name: string;
  email: string;
  phone: string;
  position: string; // 직책/직함
}

export interface Factory {
  id: FactoryId;
  name: string;
  type: FactoryType; // Using enum instead of string literals
  address: string;
  contact: string;
  email: string;
  capacity: string;
  certifications: CertificationType[];
  managers?: FactoryManager[]; // 공장 담당자들 (복수)
}

// Export factories as a getter function to avoid circular dependency
export const getFactories = (): Factory[] => {
  try {
    // Dynamic import to avoid circular dependency at module load time
    const { MockDatabaseImpl } = require('../mocks/database/MockDatabase');
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    if (!database || !database.factories || database.factories.size === 0) {
      return [];
    }
    
    return Array.from(database.factories.values()) as Factory[];
  } catch (error) {
    console.error('Failed to load factories from database:', error);
    return [];
  }
};

// Legacy export for backward compatibility - use getFactories() instead
export const factories: Factory[] = [];

// Task types by factory type mapping
export const taskTypesByFactoryType: Record<FactoryType, string[]> = {
  [FactoryType.MANUFACTURING]: [
    TASK_TYPES.SOURCING,
    TASK_TYPES.PRODUCTION,
    TASK_TYPES.QUALITY_CHECK,
  ],
  [FactoryType.CONTAINER]: [
    TASK_TYPES.CONTAINER_PRODUCTION,
    TASK_TYPES.CONTAINER_QUALITY_CHECK,
  ],
  [FactoryType.PACKAGING]: [
    TASK_TYPES.PACKING_DESIGN,
    TASK_TYPES.PACKAGING,
    TASK_TYPES.DELIVERY,
  ],
};