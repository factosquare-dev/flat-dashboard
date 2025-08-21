import type { Project } from '@/shared/types/project';
import { getHierarchicalProjectsData } from '@/core/database/hierarchicalProjects';
import { ProjectType } from '@/shared/types/enums';

/**
 * Get the count of sub-projects for a master project
 */
export const getSubProjectCount = (masterProjectId: string): number => {
  try {
    const hierarchicalProjects = getHierarchicalProjectsData();
    const masterProject = hierarchicalProjects.find(p => p.id === masterProjectId);
    
    if (!masterProject || !masterProject.children) {
      return 0;
    }
    
    // Count only SUB type children
    return masterProject.children.filter(child => child.type === ProjectType.SUB).length;
  } catch (error) {
    console.warn('Error getting sub-project count:', error);
    return 0;
  }
};

/**
 * Check if a project has sub-projects
 */
export const hasSubProjects = (masterProjectId: string): boolean => {
  return getSubProjectCount(masterProjectId) > 0;
};