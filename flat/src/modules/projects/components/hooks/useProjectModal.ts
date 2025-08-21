/**
 * Project modal management hook
 */

import { useState, useCallback } from 'react';
import type { Project } from '@/shared/types/project';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';

export const useProjectModal = () => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const openCreateModal = useCallback(() => {
    setModalMode('create');
    setEditingProject(null);
    setShowProjectModal(true);
  }, []);

  const openEditModal = useCallback(async (project: Project) => {
    // Fetch fresh data from MockDB to prevent data corruption
    try {
      const db = MockDatabaseImpl.getInstance();
      const projectResponse = await db.getProject(project.id);
      
      if (projectResponse.success && projectResponse.data) {
        // Get the complete project with all relationships
        const freshProject = projectResponse.data;
        
        // Fetch related data
        const database = db.getDatabase();
        
        // Get customer data
        if (freshProject.customerId) {
          const customer = database.customers.get(freshProject.customerId);
          if (customer) {
            freshProject.customer = customer;
            freshProject.client = customer.name;
          }
        }
        
        // Get manager data
        if (freshProject.managerId) {
          const manager = database.users.get(freshProject.managerId);
          if (manager) {
            freshProject.manager = manager.name;
          }
        }
        
        // Get product type - might come from project.productType or project.product.name
        if (!freshProject.productType && freshProject.product) {
          freshProject.productType = freshProject.product.name;
        }
        
        // Get factory names
        const getFactoryNames = (factoryIds: string | string[]): string | string[] => {
          const ids = Array.isArray(factoryIds) ? factoryIds : [factoryIds];
          const names = ids.map(id => {
            const factory = database.factories.get(id);
            return factory ? factory.name : id;
          });
          return Array.isArray(factoryIds) ? names : names[0] || '';
        };
        
        if (freshProject.manufacturerId) {
          freshProject.manufacturer = getFactoryNames(freshProject.manufacturerId);
        }
        if (freshProject.containerId) {
          freshProject.container = getFactoryNames(freshProject.containerId);
        }
        if (freshProject.packagingId) {
          freshProject.packaging = getFactoryNames(freshProject.packagingId);
        }
        
        setModalMode('edit');
        setEditingProject(freshProject);
        setShowProjectModal(true);
      } else {
        console.error('[useProjectModal] Project not found in MockDB:', project.id);
        // Fallback to passed project if not found
        setModalMode('edit');
        setEditingProject(project);
        setShowProjectModal(true);
      }
    } catch (error) {
      console.error('[useProjectModal] Error fetching project from MockDB:', error);
      // Fallback to passed project on error
      setModalMode('edit');
      setEditingProject(project);
      setShowProjectModal(true);
    }
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