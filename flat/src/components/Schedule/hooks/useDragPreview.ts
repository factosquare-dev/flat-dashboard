import { useState } from 'react';
import { factories } from '../../../data/factories';

export const useDragPreview = (projects: any[]) => {
  const [dragPreview, setDragPreview] = useState<{ projectId: string; startDate: string; endDate: string } | null>(null);
  const [lastValidProjectId, setLastValidProjectId] = useState<string | null>(null);

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
    if (!projectId) {
      // Keep last valid preview if no project found
      if (lastValidProjectId) {
        setDragPreview({
          projectId: lastValidProjectId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
      }
      return;
    }

    const targetProject = projects.find(p => p.id === projectId);
    if (!targetProject) return;

    // Check factory compatibility
    if (!validateFactoryCompatibility(draggedTaskFactory, targetProject.name)) {
      // Don't update preview for incompatible factories, keep last valid
      if (lastValidProjectId) {
        setDragPreview({
          projectId: lastValidProjectId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
      }
      return;
    }

    // Valid project and compatible factory
    setLastValidProjectId(projectId);
    setDragPreview({
      projectId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const clearPreview = () => {
    setDragPreview(null);
    setLastValidProjectId(null);
  };

  const initializePreview = (draggedTask: any) => {
    if (!projects.length) return;

    const draggedTaskFactory = draggedTask.factory;
    const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
    
    const compatibleProject = projects.find(p => {
      const targetFactory = factories.find(f => f.name === p.name);
      return !draggedFactory || !targetFactory || draggedFactory.type === targetFactory.type;
    });
    
    if (compatibleProject) {
      setLastValidProjectId(compatibleProject.id);
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