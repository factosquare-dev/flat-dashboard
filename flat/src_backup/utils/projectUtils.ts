import type { Project } from '@/types/project';
import { getHierarchicalProjectsData } from '@/data/hierarchicalProjects';
import { ProjectType } from '@/types/enums';

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