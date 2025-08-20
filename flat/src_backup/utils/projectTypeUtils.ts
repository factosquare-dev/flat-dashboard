import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { ProjectType } from '@/types/enums';

export interface ProjectTypeInfo {
  code: string;
  displayName: string;
}

// Cache for project type mappings
let projectTypeCache: Map<string, ProjectTypeInfo> | null = null;

// Get project type info from DB
export const getProjectTypeInfo = (projectType: string): ProjectTypeInfo => {
  // Initialize cache if needed
  if (!projectTypeCache) {
    projectTypeCache = new Map();
    
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      
      Array.from(database.projectTypeMappings.values()).forEach(ptm => {
        const info: ProjectTypeInfo = {
          code: ptm.code,
          displayName: ptm.displayName
        };
        
        // Store by both code and displayName for easy lookup
        projectTypeCache!.set(ptm.code, info);
        projectTypeCache!.set(ptm.displayName, info);
        projectTypeCache!.set(ptm.displayName.toLowerCase(), info);
      });
    } catch (error) {
      // Error loading project type mappings
    }
  }
  
  // Return cached info or default
  const cached = projectTypeCache.get(projectType) || projectTypeCache.get(projectType.toLowerCase());
  return cached || {
    code: projectType,
    displayName: projectType
  };
};

// Get project type display name
export const getProjectTypeDisplayName = (projectType: string): string => {
  return getProjectTypeInfo(projectType).displayName;
};

// Check if project type matches enum
export const isProjectType = (type: string | ProjectType, targetType: ProjectType): boolean => {
  // Direct comparison - both should be ProjectType enum values
  return type === targetType;
};

// Get all project types
export const getAllProjectTypes = (): ProjectTypeInfo[] => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    return Array.from(database.projectTypeMappings.values())
      .sort((a, b) => a.order - b.order)
      .map(ptm => ({
        code: ptm.code,
        displayName: ptm.displayName
      }));
  } catch (error) {
    // Error getting all project types
    return [];
  }
};

// Clear cache when needed
export const clearProjectTypeCache = () => {
  projectTypeCache = null;
};