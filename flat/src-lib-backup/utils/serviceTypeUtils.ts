import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import type { ServiceType } from '../types/project';

export interface ServiceTypeInfo {
  code: string;
  displayName: string;
  description?: string;
}

// Cache for service type mappings
let serviceTypeCache: Map<string, ServiceTypeInfo> | null = null;

// Get service type info from DB
export const getServiceTypeInfo = (serviceType: ServiceType | string): ServiceTypeInfo => {
  // Initialize cache if needed
  if (!serviceTypeCache) {
    serviceTypeCache = new Map();
    
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      
      Array.from(database.serviceTypeMappings.values()).forEach(stm => {
        const info: ServiceTypeInfo = {
          code: stm.code,
          displayName: stm.displayName,
          description: stm.description
        };
        
        // Store by both code and displayName for easy lookup
        serviceTypeCache!.set(stm.code, info);
        serviceTypeCache!.set(stm.displayName, info);
      });
    } catch (error) {
      // Error loading service type mappings
    }
  }
  
  // Return cached info or default
  return serviceTypeCache.get(serviceType) || {
    code: serviceType,
    displayName: serviceType,
    description: undefined
  };
};

// Get service type display name
export const getServiceTypeDisplayName = (serviceType: ServiceType | string): string => {
  if (!serviceType) {
    return '서비스 유형 선택';
  }
  return getServiceTypeInfo(serviceType).displayName;
};

// Get all service types
export const getAllServiceTypes = (): ServiceTypeInfo[] => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    return Array.from(database.serviceTypeMappings.values())
      .sort((a, b) => a.order - b.order)
      .map(stm => ({
        code: stm.code,
        displayName: stm.displayName,
        description: stm.description
      }));
  } catch (error) {
    // Error getting all service types
    return [];
  }
};

// Clear cache when needed
export const clearServiceTypeCache = () => {
  serviceTypeCache = null;
};