/**
 * Factory Statistics Service
 * Calculates and manages factory-related statistics
 */

import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { DbResponse, UserFactory, FactoryProject } from '@/mocks/database/types';
import { ProjectStatus } from '@/types/project';
import { TaskStatus } from '@/types/schedule';

export interface FactoryStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalUsers: number;
  capacityUtilization: number;
  averageProjectDuration: number;
  onTimeDeliveryRate: number;
  taskCompletionRate: number;
}

export class FactoryStatisticsService {
  private db = MockDatabaseImpl.getInstance();

  /**
   * Calculate comprehensive factory statistics
   */
  async calculateFactoryStatistics(factoryId: string): Promise<DbResponse<FactoryStatistics>> {
    try {
      // Get all factory projects
      const projectRelationsResult = await this.db.getAll('factoryProjects');
      if (!projectRelationsResult.success || !projectRelationsResult.data) {
        return {
          success: false,
          error: 'Failed to fetch factory projects',
        };
      }

      const factoryProjectRelations = projectRelationsResult.data.filter(
        (fp: FactoryProject) => fp.factoryId === factoryId
      );

      let totalProjects = 0;
      let activeProjects = 0;
      let completedProjects = 0;
      let totalDuration = 0;
      let onTimeDeliveries = 0;
      let totalTasks = 0;
      let completedTasks = 0;

      // Analyze each project
      for (const relation of factoryProjectRelations) {
        const projectResult = await this.db.get('projects', relation.projectId);
        if (projectResult.success && projectResult.data) {
          const project = projectResult.data;
          totalProjects++;

          if (project.status === ProjectStatus.IN_PROGRESS) {
            activeProjects++;
          } else if (project.status === ProjectStatus.COMPLETED) {
            completedProjects++;
            
            // Calculate duration
            const start = new Date(project.startDate);
            const end = new Date(project.endDate);
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            totalDuration += duration;

            // Check if delivered on time
            const actualEnd = new Date(project.updatedAt);
            if (actualEnd <= end) {
              onTimeDeliveries++;
            }
          }

          // Get project tasks
          const schedulesResult = await this.db.getAll('schedules');
          if (schedulesResult.success && schedulesResult.data) {
            const projectSchedule = schedulesResult.data.find(
              (s: any) => s.projectId === project.id
            );

            if (projectSchedule) {
              const tasksResult = await this.db.getAll('tasks');
              if (tasksResult.success && tasksResult.data) {
                const projectTasks = tasksResult.data.filter(
                  (t: any) => t.scheduleId === projectSchedule.id && t.factoryId === factoryId
                );

                totalTasks += projectTasks.length;
                completedTasks += projectTasks.filter(
                  (t: any) => t.status === TaskStatus.COMPLETED
                ).length;
              }
            }
          }
        }
      }

      // Get total users
      const userRelationsResult = await this.db.getAll('userFactories');
      const totalUsers = userRelationsResult.success && userRelationsResult.data
        ? userRelationsResult.data.filter((uf: UserFactory) => uf.factoryId === factoryId).length
        : 0;

      // Calculate metrics
      const capacityUtilization = totalProjects > 0 
        ? Math.round((activeProjects / totalProjects) * 100) 
        : 0;

      const averageProjectDuration = completedProjects > 0
        ? Math.round(totalDuration / completedProjects)
        : 0;

      const onTimeDeliveryRate = completedProjects > 0
        ? Math.round((onTimeDeliveries / completedProjects) * 100)
        : 100;

      const taskCompletionRate = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

      return {
        success: true,
        data: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalUsers,
          capacityUtilization,
          averageProjectDuration,
          onTimeDeliveryRate,
          taskCompletionRate,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate factory statistics',
      };
    }
  }

  /**
   * Get factory capacity analysis
   */
  async getCapacityAnalysis(factoryId: string): Promise<DbResponse<{
    currentLoad: number;
    maxCapacity: number;
    utilizationPercentage: number;
    availableCapacity: number;
  }>> {
    try {
      const factoryResult = await this.db.get('factories', factoryId);
      if (!factoryResult.success || !factoryResult.data) {
        return {
          success: false,
          error: 'Factory not found',
        };
      }

      const factory = factoryResult.data;
      const maxCapacity = factory.capacity || 100; // Default capacity

      // Get active projects count
      const statsResult = await this.calculateFactoryStatistics(factoryId);
      if (!statsResult.success || !statsResult.data) {
        return {
          success: false,
          error: 'Failed to calculate statistics',
        };
      }

      const currentLoad = statsResult.data.activeProjects;
      const utilizationPercentage = Math.round((currentLoad / maxCapacity) * 100);
      const availableCapacity = maxCapacity - currentLoad;

      return {
        success: true,
        data: {
          currentLoad,
          maxCapacity,
          utilizationPercentage,
          availableCapacity,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze factory capacity',
      };
    }
  }

  /**
   * Get factory performance trends
   */
  async getPerformanceTrends(factoryId: string, months: number = 6): Promise<DbResponse<{
    monthlyData: Array<{
      month: string;
      projectsCompleted: number;
      averageDuration: number;
      onTimeRate: number;
    }>;
  }>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const monthlyData: Array<{
        month: string;
        projectsCompleted: number;
        averageDuration: number;
        onTimeRate: number;
      }> = [];

      // TODO: Implement monthly trend calculation
      // This would require analyzing historical project data

      return {
        success: true,
        data: {
          monthlyData,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance trends',
      };
    }
  }
}