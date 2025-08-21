import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDataService } from '@/core/services/mockDataService';
import { ProjectType } from '@/shared/types/enums';
import type { Project } from '@/shared/types/project';

/**
 * Business logic hook for MasterProjectDetail component
 * Handles project loading, selection, pagination, and save confirmation logic
 */
export const useMasterProjectDetail = (projectId?: string) => {
  const navigate = useNavigate();
  
  // Project state
  const [subProjects, setSubProjects] = useState<Project[]>([]);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  
  // Save confirmation state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingProjectIndex, setPendingProjectIndex] = useState<number | null>(null);
  
  // Pagination state
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const itemsPerPage = 5;
  
  // Load SUB projects for this master project
  useEffect(() => {
    if (projectId) {
      const allProjects = mockDataService.getAllProjects();
      const subs = allProjects.filter(
        (p) => p.parentId === projectId && p.type === ProjectType.SUB
      );
      setSubProjects(subs);
      setSelectedProjectIndex(0);
    }
  }, [projectId]);

  // Pagination logic for more than 5 items
  const showPagination = subProjects.length > itemsPerPage;
  const totalPages = Math.ceil(subProjects.length / itemsPerPage);
  const displayProjects = showPagination 
    ? subProjects.slice(
        currentPageIndex * itemsPerPage,
        (currentPageIndex + 1) * itemsPerPage
      )
    : subProjects;

  // Navigation handlers
  const handleBack = () => {
    navigate('/projects');
  };

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

  // Project selection with save confirmation
  const handleSelectProject = (absoluteIndex: number) => {
    if (hasUnsavedChanges) {
      setPendingProjectIndex(absoluteIndex);
      setShowSaveDialog(true);
    } else {
      switchToProject(absoluteIndex);
    }
  };

  const switchToProject = (absoluteIndex: number) => {
    setSelectedProjectIndex(absoluteIndex);
    setHasUnsavedChanges(false);
    // Update page index if selecting item outside current page
    if (showPagination) {
      const pageOfSelectedItem = Math.floor(absoluteIndex / itemsPerPage);
      if (pageOfSelectedItem !== currentPageIndex) {
        setCurrentPageIndex(pageOfSelectedItem);
      }
    }
  };

  // Save confirmation dialog handlers
  const handleSaveAndSwitch = () => {
    // TODO: 실제 저장 로직 구현
    console.log('Saving current form data...');
    if (pendingProjectIndex !== null) {
      switchToProject(pendingProjectIndex);
      setPendingProjectIndex(null);
    }
    setShowSaveDialog(false);
  };

  const handleDiscardAndSwitch = () => {
    if (pendingProjectIndex !== null) {
      switchToProject(pendingProjectIndex);
      setPendingProjectIndex(null);
    }
    setShowSaveDialog(false);
  };

  const handleCancelSwitch = () => {
    setPendingProjectIndex(null);
    setShowSaveDialog(false);
  };

  return {
    // Project data
    subProjects,
    selectedProjectIndex,
    
    // Pagination data
    showPagination,
    currentPageIndex,
    totalPages,
    displayProjects,
    itemsPerPage,
    
    // Save confirmation state
    hasUnsavedChanges,
    showSaveDialog,
    pendingProjectIndex,
    
    // Handlers
    handleBack,
    handlePrevious,
    handleNext,
    handleSelectProject,
    setHasUnsavedChanges,
    handleSaveAndSwitch,
    handleDiscardAndSwitch,
    handleCancelSwitch,
  };
};