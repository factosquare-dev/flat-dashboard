import { useState, useEffect } from 'react';
import { mockDataService } from '@/services/mockDataService';
import { ProjectType } from '@/types/enums';
import type { Project } from '@/types/project';

export const useProjectDetails = (projectId?: string) => {
  const [subProjects, setSubProjects] = useState<Project[]>([]);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const itemsPerPage = 5;

  // Load SUB projects for this master project
  useEffect(() => {
    if (projectId) {
      // Get all projects and filter SUB projects that belong to this master
      const allProjects = mockDataService.getAllProjects();
      const subs = allProjects.filter(
        (p) => p.parentId === projectId && p.type === ProjectType.SUB
      );
      
      setSubProjects(subs);
      setSelectedProjectIndex(0);
      setCurrentPageIndex(0);
    }
  }, [projectId]);

  // Currently selected SUB project
  const selectedProject = subProjects[selectedProjectIndex];
  
  // Pagination - show 5 projects at a time
  const totalPages = Math.ceil(subProjects.length / itemsPerPage);
  const currentProjects = subProjects.slice(
    currentPageIndex * itemsPerPage,
    (currentPageIndex + 1) * itemsPerPage
  );

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handleSelectProject = (absoluteIndex: number) => {
    setSelectedProjectIndex(absoluteIndex);
  };

  return {
    subProjects,
    selectedProject,
    selectedProjectIndex,
    currentProjects,
    totalPages,
    currentPageIndex,
    itemsPerPage,
    handlePrevious,
    handleNext,
    handleSelectProject
  };
};