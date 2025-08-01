import type { Project, HierarchicalProject } from '../types/project';
import type { ProjectId } from '../types/branded';
import { ProjectType } from '../types/enums';
import { isProjectType } from '../utils/projectTypeUtils';

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
}