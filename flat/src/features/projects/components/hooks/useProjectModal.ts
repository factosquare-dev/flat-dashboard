/**
 * Project modal management hook
 */

import { useState, useCallback } from 'react';
import type { Project } from '../../../../types/project';

export const useProjectModal = () => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const openCreateModal = useCallback(() => {
    setModalMode('create');
    setEditingProject(null);
    setShowProjectModal(true);
  }, []);

  const openEditModal = useCallback((project: Project) => {
    setModalMode('edit');
    setEditingProject(project);
    setShowProjectModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowProjectModal(false);
    setEditingProject(null);
  }, []);

  return {
    showProjectModal,
    modalMode,
    editingProject,
    openCreateModal,
    openEditModal,
    closeModal,
    setShowProjectModal,
  };
};