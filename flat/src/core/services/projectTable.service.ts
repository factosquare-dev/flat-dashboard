import type { Project, HierarchicalProject } from '@/shared/types/project';
import type { ProjectId } from '@/shared/types/branded';
import { ProjectType } from '@/shared/types/enums';
import { isProjectType } from '@/shared/utils/projectTypeUtils';
import { toLocalDateString } from '@/shared/utils/unifiedDateUtils';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';

export class ProjectTableService {
  /**
   * Flatten hierarchical projects into a flat array
   */
  static flattenHierarchicalProjects(hierarchicalProjects: HierarchicalProject[]): Project[] {
    const flattened: Project[] = [];
    
    const flatten = (items: HierarchicalProject[]) => {
      items.forEach(item => {
        flattened.push(item);
        if (item.children) {
          flatten(item.children);
        }
      });
    };
    
    flatten(hierarchicalProjects);
    return flattened;
  }

  /**
   * Get children IDs for a Master project
   */
  static getChildrenIds(projectId: ProjectId, allProjects: Project[]): ProjectId[] {
    return allProjects
      .filter(p => p.parentId === projectId)
      .map(p => p.id);
  }

  /**
   * Handle row selection logic including Master-SUB relationships
   */
  static handleRowSelection(
    projectId: string,
    checked: boolean,
    allProjects: Project[],
    selectedRows: string[]
  ): string[] {
    const project = allProjects.find(p => p.id === projectId);
    
    if (project && isProjectType(project.type, ProjectType.MASTER)) {
      // For Master projects, select/deselect all its children
      const childrenIds = this.getChildrenIds(projectId as ProjectId, allProjects);
      
      if (checked) {
        // Add Master and all children to selection
        const newSelection = new Set(selectedRows);
        newSelection.add(projectId);
        childrenIds.forEach(id => newSelection.add(id));
        return Array.from(newSelection);
      } else {
        // Remove Master and all children from selection
        const newSelection = new Set(selectedRows);
        newSelection.delete(projectId);
        childrenIds.forEach(id => newSelection.delete(id));
        return Array.from(newSelection);
      }
    } else {
      // For SUB projects, handle normal selection
      if (checked) {
        return [...selectedRows, projectId];
      } else {
        return selectedRows.filter(id => id !== projectId);
      }
    }
  }

  /**
   * Check if drag selection should be allowed for a project
   */
  static canStartDragSelection(project: Project): boolean {
    return !isProjectType(project.type, ProjectType.MASTER);
  }

  /**
   * Filter projects by search query
   */
  static filterBySearch(projects: Project[], searchQuery: string): Project[] {
    if (!searchQuery) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter(project => 
      project.client?.toLowerCase().includes(query) ||
      project.productType?.toLowerCase().includes(query) ||
      project.manager?.toLowerCase().includes(query) ||
      project.manufacturer?.toLowerCase().includes(query)
    );
  }

  /**
   * Sort projects by field
   */
  static sortProjects<K extends keyof Project>(
    projects: Project[], 
    field: K, 
    direction: 'asc' | 'desc'
  ): Project[] {
    return [...projects].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Duplicate a project with cascade support for Master-SUB relationships
   */
  static prepareDuplicateProject(project: Project): {
    masterProject: Omit<Project, 'id'>;
    subProjects: Omit<Project, 'id'>[];
    newMasterId?: string;
  } {
    const db = MockDatabaseImpl.getInstance();
    const freshProject = db.getProject(project.id) || project;
    const currentDate = toLocalDateString(new Date());
    
    // Check if this is a Master project
    if (isProjectType(freshProject.type, ProjectType.MASTER)) {
      // Get all SUB projects associated with this Master
      const allProjects = Array.from(db.getDatabase().projects.values());
      const subProjects = allProjects.filter(p => 
        isProjectType(p.type, ProjectType.SUB) && p.parentId === freshProject.id
      );
      
      // Prepare new Master project
      const { id: masterId, ...masterWithoutId } = freshProject;
      const newMasterId = `project-${Date.now()}`;
      const masterProject = {
        ...masterWithoutId,
        startDate: currentDate,
        endDate: currentDate
      };
      
      // Prepare SUB projects with new parent ID
      const duplicatedSubProjects = subProjects.map((subProject, index) => {
        const { id: subId, ...subWithoutId } = subProject;
        return {
          ...subWithoutId,
          parentId: newMasterId as ProjectId,
          startDate: currentDate,
          endDate: currentDate
        };
      });
      
      return {
        masterProject,
        subProjects: duplicatedSubProjects,
        newMasterId
      };
    } else {
      // Not a Master project, prepare single project
      const { id, ...projectWithoutId } = freshProject;
      const duplicatedProject = {
        ...projectWithoutId,
        startDate: currentDate,
        endDate: currentDate
      };
      
      return {
        masterProject: duplicatedProject,
        subProjects: []
      };
    }
  }
}