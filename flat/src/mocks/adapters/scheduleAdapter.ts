/**
 * Schedule Adapter
 * Converts between mock database format and legacy UI format
 */

import { Schedule, Task, TaskStatus, Participant, ParticipantLegacy } from '@/types/schedule';
import { getSafeDatabase } from '../database/utils';
import { User } from '@/types/user';

export class ScheduleAdapter {

  /**
   * Convert Schedule and Tasks from DB format to legacy UI format
   */
  convertToLegacyFormat(schedule: Schedule): {
    participants: ParticipantLegacy[];
    tasks: any[];
    startDate: string;
    endDate: string;
  } {
    const db = getSafeDatabase();
    
    // Return empty data if database is not available
    if (!db) {
      console.warn('[ScheduleAdapter] Database not available, returning empty data');
      return {
        participants: [],
        tasks: [],
        startDate: schedule.startDate?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: schedule.endDate?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0]
      };
    }
    
    const tasks = Array.from(db.tasks.values())
      .filter(task => task.scheduleId === schedule.id);
    
    const users = db.users;
    const factories = db.factories;
    const projects = db.projects;
    
    // Get the project to find its associated factories
    const project = projects.get(schedule.projectId);
    // console.log('[ScheduleAdapter] Project for schedule:', project);
    
    // Get factories from the project data (manufacturing, packaging, container)
    const factoryMap = new Map<string, any>();
    
    if (project) {
      // console.log('[ScheduleAdapter] Project factory IDs:', {
      //   manufacturerId: project.manufacturerId,
      //   containerId: project.containerId,
      //   packagingId: project.packagingId
      // });
      
      // Add manufacturing factory
      if (project.manufacturerId) {
        const manufacturingFactory = factories.get(project.manufacturerId);
        if (manufacturingFactory) {
          factoryMap.set(manufacturingFactory.id, manufacturingFactory);
          // console.log('[ScheduleAdapter] Added manufacturing factory:', manufacturingFactory.name);
        }
      }
      
      // Add container factory
      if (project.containerId) {
        const containerFactory = factories.get(project.containerId);
        if (containerFactory) {
          factoryMap.set(containerFactory.id, containerFactory);
          // console.log('[ScheduleAdapter] Added container factory:', containerFactory.name);
        }
      }
      
      // Add packaging factory
      if (project.packagingId) {
        const packagingFactory = factories.get(project.packagingId);
        if (packagingFactory) {
          factoryMap.set(packagingFactory.id, packagingFactory);
          // console.log('[ScheduleAdapter] Added packaging factory:', packagingFactory.name);
        }
      }
    }
    
    // Also add any additional factories from tasks (as fallback)
    tasks.forEach(task => {
      if (task.factoryId) {
        const factory = factories.get(task.factoryId);
        if (factory && !factoryMap.has(task.factoryId)) {
          factoryMap.set(task.factoryId, factory);
        }
      }
    });
    
    // Convert to legacy participant format using factory names
    const participants: ParticipantLegacy[] = Array.from(factoryMap.values()).map((factory, index) => ({
      id: factory.id,
      name: `${factory.name} (${factory.type})`, // 공장 이름과 타입 표시
      period: `${schedule.startDate.toISOString().split('T')[0]} ~ ${schedule.endDate.toISOString().split('T')[0]}`,
      color: this.getUserColor(index),
      order: index
    }));
    
    // console.log('[ScheduleAdapter] Final participants:', participants.map(p => p.name));
    
    // Convert tasks to legacy format
    const legacyTasks = tasks.map((task, index) => {
      const factory = task.factoryId ? factories.get(task.factoryId) : null;
      const mainParticipant = task.participants.find(p => p.role === 'manager') || task.participants[0];
      const user = mainParticipant ? users.get(mainParticipant.userId) : null;
      
      return {
        id: index + 1, // Legacy uses numeric IDs
        title: task.title,
        taskType: this.mapTaskType(task.type),
        projectId: schedule.projectId,
        factory: factory?.name || '',
        details: task.notes || '',
        startDate: task.startDate.toISOString().split('T')[0],
        endDate: task.endDate.toISOString().split('T')[0],
        color: this.getTaskColor(task.type),
        isCompleted: task.status === TaskStatus.COMPLETED,
        assignee: user?.name || 'Unknown',
        dependsOn: task.dependsOn.map(id => this.getTaskNumericId(id, tasks)),
        blockedBy: task.blockedBy.map(id => this.getTaskNumericId(id, tasks)),
        status: this.mapTaskStatus(task.status),
        progress: task.progress
      };
    });
    
    return {
      participants,
      tasks: legacyTasks,
      startDate: schedule.startDate.toISOString().split('T')[0],
      endDate: schedule.endDate.toISOString().split('T')[0]
    };
  }
  
  /**
   * Get numeric ID for task (for legacy dependsOn/blockedBy arrays)
   */
  private getTaskNumericId(taskId: string, allTasks: Task[]): number {
    const index = allTasks.findIndex(t => t.id === taskId);
    return index + 1; // Legacy uses 1-based indexing
  }
  
  /**
   * Map task type to legacy format
   */
  private mapTaskType(type: string): string {
    const typeMap: Record<string, string> = {
      'material': '원료',
      'production': '제조',
      'quality': '품질',
      'packaging': '포장',
      'inspection': '검수',
      'shipping': '배송',
      'other': '기타'
    };
    return typeMap[type] || type;
  }
  
  /**
   * Map task status to legacy format
   */
  private mapTaskStatus(status: TaskStatus): string {
    const statusMap: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: 'pending',
      [TaskStatus.IN_PROGRESS]: 'in-progress',
      [TaskStatus.COMPLETED]: 'completed',
      [TaskStatus.BLOCKED]: 'blocked',
      [TaskStatus.APPROVED]: 'approved',
      [TaskStatus.REJECTED]: 'rejected'
    };
    return statusMap[status] || 'pending';
  }
  
  /**
   * Get color for user (for legacy participant color)
   */
  private getUserColor(index: number): string {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#14B8A6', // teal
      '#F97316'  // orange
    ];
    return colors[index % colors.length];
  }
  
  /**
   * Get color for task type
   */
  private getTaskColor(type: string): string {
    const colorMap: Record<string, string> = {
      'material': '#9333EA',
      'production': '#3B82F6',
      'quality': '#10B981',
      'packaging': '#F59E0B',
      'inspection': '#EC4899',
      'shipping': '#14B8A6',
      'other': '#6B7280'
    };
    return colorMap[type] || '#6B7280';
  }
}

export const scheduleAdapter = new ScheduleAdapter();