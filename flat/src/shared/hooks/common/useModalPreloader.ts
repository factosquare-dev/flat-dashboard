/**
 * Modal preloader hook for better performance
 */

import { useEffect, useCallback } from 'react';
import { logger } from '@/shared/utils/logger';

interface ModalPreloadConfig {
  modalType: string;
  preloadCondition?: () => boolean;
  priority?: 'high' | 'medium' | 'low';
}

const defaultPreloadConfigs: ModalPreloadConfig[] = [
  {
    modalType: 'confirmation',
    priority: 'high', // Always needed
  },
  {
    modalType: 'project-create',
    preloadCondition: () => window.location.pathname.includes('/projects'),
    priority: 'medium',
  },
  {
    modalType: 'project-edit',
    preloadCondition: () => window.location.pathname.includes('/projects'),
    priority: 'medium',
  },
  {
    modalType: 'task-create',
    preloadCondition: () => window.location.pathname.includes('/schedule'),
    priority: 'medium',
  },
  {
    modalType: 'task-edit',
    preloadCondition: () => window.location.pathname.includes('/schedule'),
    priority: 'medium',
  },
];

// Modal import registry
const modalImports = {
  'confirmation': () => import('@/shared/components/ConfirmationModal'),
  'project-create': () => import('@/modules/projects/components/ProjectCreateModal'),
  'project-edit': () => import('@/modules/projects/components/ProjectEditModal'),
  'project-delete': () => import('@/modules/projects/components/ProjectDeleteModal'),
  'task-create': () => import('@/modules/schedule/components/TaskCreateModal'),
  'task-edit': () => import('@/modules/schedule/components/TaskEditModal'),
  'task-delete': () => import('@/modules/schedule/components/TaskDeleteModal'),
  'factory-create': () => import('@/modules/factories/components/FactoryCreateModal'),
  'factory-edit': () => import('@/modules/factories/components/FactoryEditModal'),
  'user-create': () => import('@/modules/users/components/UserCreateModal'),
  'user-edit': () => import('@/modules/users/components/UserEditModal'),
  'email-compose': () => import('@/shared/components/email/ComposeEmailModal'),
  'workflow-create': () => import('@/shared/components/workflow/WorkflowCreateModal'),
  'settings': () => import('@/shared/components/settings/SettingsModal'),
} as const;

// Track preloaded modals to avoid duplicate requests
const preloadedModals = new Set<string>();
const preloadPromises = new Map<string, Promise<any>>();

/**
 * Preload a modal component
 */
function preloadModal(modalType: keyof typeof modalImports): Promise<any> {
  if (preloadedModals.has(modalType)) {
    return Promise.resolve();
  }

  if (preloadPromises.has(modalType)) {
    return preloadPromises.get(modalType)!;
  }

  const importFn = modalImports[modalType];
  if (!importFn) {
    logger.warn(`Modal type "${modalType}" not found in imports registry`);
    return Promise.resolve();
  }

  const promise = importFn()
    .then((module) => {
      preloadedModals.add(modalType);
      preloadPromises.delete(modalType);
      return module;
    })
    .catch((error) => {
      logger.error(`Failed to preload modal "${modalType}"`, { modalType, error });
      preloadPromises.delete(modalType);
      throw error;
    });

  preloadPromises.set(modalType, promise);
  return promise;
}

/**
 * Hook for preloading modals based on configuration
 */
export function useModalPreloader(configs: ModalPreloadConfig[] = defaultPreloadConfigs) {
  useEffect(() => {
    const preloadHighPriority = async () => {
      const highPriorityModals = configs
        .filter(config => config.priority === 'high')
        .filter(config => !config.preloadCondition || config.preloadCondition());

      // Preload high priority modals immediately
      await Promise.allSettled(
        highPriorityModals.map(config => preloadModal(config.modalType as keyof typeof modalImports))
      );
    };

    const preloadMediumPriority = async () => {
      const mediumPriorityModals = configs
        .filter(config => config.priority === 'medium')
        .filter(config => !config.preloadCondition || config.preloadCondition());

      // Preload medium priority modals with slight delay
      await new Promise(resolve => setTimeout(resolve, 100));
      await Promise.allSettled(
        mediumPriorityModals.map(config => preloadModal(config.modalType as keyof typeof modalImports))
      );
    };

    const preloadLowPriority = async () => {
      const lowPriorityModals = configs
        .filter(config => config.priority === 'low')
        .filter(config => !config.preloadCondition || config.preloadCondition());

      // Preload low priority modals when browser is idle
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          Promise.allSettled(
            lowPriorityModals.map(config => preloadModal(config.modalType as keyof typeof modalImports))
          );
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          Promise.allSettled(
            lowPriorityModals.map(config => preloadModal(config.modalType as keyof typeof modalImports))
          );
        }, 1000);
      }
    };

    // Execute preloading in priority order
    preloadHighPriority()
      .then(() => preloadMediumPriority())
      .then(() => preloadLowPriority())
      .catch(() => {
        // Modal preloading failed silently
      });
  }, [configs]);

  // Manual preload function
  const manualPreload = useCallback((modalType: keyof typeof modalImports) => {
    return preloadModal(modalType);
  }, []);

  // Check if modal is preloaded
  const isPreloaded = useCallback((modalType: string) => {
    return preloadedModals.has(modalType);
  }, []);

  // Get preload statistics
  const getPreloadStats = useCallback(() => {
    return {
      preloadedCount: preloadedModals.size,
      pendingCount: preloadPromises.size,
      totalModals: Object.keys(modalImports).length,
      preloadedModals: Array.from(preloadedModals),
    };
  }, []);

  return {
    manualPreload,
    isPreloaded,
    getPreloadStats,
  };
}

/**
 * Hook for intelligent modal preloading based on user behavior
 */
export function useAdaptiveModalPreloader() {
  const { manualPreload, isPreloaded } = useModalPreloader();

  // Preload modal on hover (for buttons that open modals)
  const preloadOnHover = useCallback((modalType: keyof typeof modalImports) => {
    return {
      onMouseEnter: () => {
        if (!isPreloaded(modalType)) {
          manualPreload(modalType);
        }
      },
    };
  }, [manualPreload, isPreloaded]);

  // Preload modal on focus (for accessibility)
  const preloadOnFocus = useCallback((modalType: keyof typeof modalImports) => {
    return {
      onFocus: () => {
        if (!isPreloaded(modalType)) {
          manualPreload(modalType);
        }
      },
    };
  }, [manualPreload, isPreloaded]);

  // Combined hover and focus preloading
  const preloadOnInteraction = useCallback((modalType: keyof typeof modalImports) => {
    return {
      ...preloadOnHover(modalType),
      ...preloadOnFocus(modalType),
    };
  }, [preloadOnHover, preloadOnFocus]);

  return {
    preloadOnHover,
    preloadOnFocus,
    preloadOnInteraction,
    manualPreload,
    isPreloaded,
  };
}

export type { ModalPreloadConfig };
export { preloadModal };