import { useMemo } from 'react';
import type { Project, HierarchicalProject } from '@/types/project';
import { ProjectTableService } from '@/services/projectTable.service';

export const useProjectTableData = (hierarchicalProjects: HierarchicalProject[]) => {
  // Flatten hierarchical projects
  const allProjects = useMemo(() => 
    ProjectTableService.flattenHierarchicalProjects(hierarchicalProjects),
    [hierarchicalProjects]
  );

  return {
    allProjects
  };
};