import { useMemo } from 'react';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import type { ScheduleFactory } from '@/shared/types/schedule';
import { getParticipantColor } from '@/shared/utils/scheduleColorManager';

/**
 * Custom hook to get project factories from MockDatabase
 * Abstracts direct database access from components
 */
export const useProjectFactories = (projectId?: string): ScheduleFactory[] => {
  return useMemo(() => {
    if (!projectId) return [];

    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      
      if (!database || database.projects.size === 0) {
        console.log('[useProjectFactories] MockDB is not initialized yet');
        return [];
      }
      
      const project = database.projects.get(projectId);
      const factoriesData = Object.fromEntries(database.factories);
      
      if (!project) return [];
      
      const factoryList: ScheduleFactory[] = [];
      
      // Process manufacturerId
      if (project.manufacturerId) {
        const manufacturerIds = Array.isArray(project.manufacturerId) 
          ? project.manufacturerId 
          : [project.manufacturerId];
          
        manufacturerIds.forEach((id: string) => {
          const factory = factoriesData[id];
          if (factory) {
            factoryList.push({
              id: factory.id,
              name: factory.name,
              type: factory.type || 'MANUFACTURER',
              period: '',
              color: getParticipantColor(factory.id)
            });
          }
        });
      }
      
      // Process containerId
      if (project.containerId) {
        const containerIds = Array.isArray(project.containerId) 
          ? project.containerId 
          : [project.containerId];
          
        containerIds.forEach((id: string) => {
          const factory = factoriesData[id];
          if (factory) {
            factoryList.push({
              id: factory.id,
              name: factory.name,
              type: factory.type || 'CONTAINER',
              period: '',
              color: getParticipantColor(factory.id)
            });
          }
        });
      }
      
      // Process packagingId
      if (project.packagingId) {
        const packagingIds = Array.isArray(project.packagingId) 
          ? project.packagingId 
          : [project.packagingId];
          
        packagingIds.forEach((id: string) => {
          const factory = factoriesData[id];
          if (factory) {
            factoryList.push({
              id: factory.id,
              name: factory.name,
              type: factory.type || 'PACKAGING',
              period: '',
              color: getParticipantColor(factory.id)
            });
          }
        });
      }
      
      return factoryList;
    } catch (error) {
      console.error('[useProjectFactories] Error getting project factories:', error);
      return [];
    }
  }, [projectId]);
};