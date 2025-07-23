import { useState } from 'react';
import { factories } from '../../../data/factories';
import { formatDateISO } from '../../../utils/dateUtils';

export const useDragPreview = (projects: any[]) => {
  const [dragPreview, setDragPreview] = useState<{ projectId: string; startDate: string; endDate: string } | null>(null);
  const [lastValidProjectId, setLastValidProjectId] = useState<string | null>(null);
  const [isInitialPosition, setIsInitialPosition] = useState(true);

  const validateFactoryCompatibility = (draggedTaskFactory: string, targetProjectName: string): boolean => {
    const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
    const targetFactory = factories.find(f => f.name === targetProjectName);
    
    if (!draggedFactory || !targetFactory) return true;
    return draggedFactory.type === targetFactory.type;
  };

  const updatePreview = (
    projectId: string | null,
    startDate: Date,
    endDate: Date,
    draggedTaskFactory: string
  ) => {
    // Always update with new dates
    const newStartDate = formatDateISO(startDate);
    const newEndDate = formatDateISO(endDate);
    
    // Mark that we've moved from initial position
    if (isInitialPosition) {
      setIsInitialPosition(false);
    }
    
    if (!projectId) {
      // Keep last valid preview project but update dates
      if (lastValidProjectId && dragPreview) {
        const updatedPreview = {
          projectId: lastValidProjectId,
          startDate: newStartDate,
          endDate: newEndDate
        };
        console.log('[DRAG PREVIEW] Updating dates with last valid project:', updatedPreview);
        setDragPreview(updatedPreview);
      }
      return;
    }

    const targetProject = projects.find(p => p.id === projectId);
    if (!targetProject) {
      // Keep current preview but update dates
      if (dragPreview) {
        const updatedPreview = {
          ...dragPreview,
          startDate: newStartDate,
          endDate: newEndDate
        };
        console.log('[DRAG PREVIEW] Project not found, updating dates only:', updatedPreview);
        setDragPreview(updatedPreview);
      }
      return;
    }

    // Check factory compatibility
    if (!validateFactoryCompatibility(draggedTaskFactory, targetProject.name)) {
      // Keep last valid project but still update dates
      if (lastValidProjectId) {
        const updatedPreview = {
          projectId: lastValidProjectId,
          startDate: newStartDate,
          endDate: newEndDate
        };
        console.log('[DRAG PREVIEW] Factory incompatible, keeping last valid project but updating dates:', updatedPreview);
        setDragPreview(updatedPreview);
      }
      return;
    }

    // Valid project and compatible factory
    setLastValidProjectId(projectId);
    const preview = {
      projectId,
      startDate: newStartDate,
      endDate: newEndDate
    };
    console.log('[DRAG PREVIEW] Updating preview with new project and dates:', preview);
    setDragPreview(preview);
  };

  const clearPreview = () => {
    setDragPreview(null);
    setLastValidProjectId(null);
    setIsInitialPosition(true);
  };

  const initializePreview = (draggedTask: any) => {
    if (!projects.length) return;

    const draggedTaskFactory = draggedTask.factory;
    const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
    
    // Find the current project first, then compatible projects
    const currentProject = projects.find(p => p.id === draggedTask.projectId);
    const compatibleProject = currentProject || projects.find(p => {
      const targetFactory = factories.find(f => f.name === p.name);
      return !draggedFactory || !targetFactory || draggedFactory.type === targetFactory.type;
    });
    
    if (compatibleProject) {
      setLastValidProjectId(compatibleProject.id);
      // Initialize preview with current task position
      const preview = {
        projectId: compatibleProject.id,
        startDate: draggedTask.startDate,
        endDate: draggedTask.endDate
      };
      console.log('[DRAG PREVIEW] Initializing preview:', preview);
      setDragPreview(preview);
    }
  };

  return {
    dragPreview,
    lastValidProjectId,
    updatePreview,
    clearPreview,
    initializePreview,
    validateFactoryCompatibility
  };
};