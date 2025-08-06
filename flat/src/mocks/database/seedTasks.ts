/**
 * Task creation for projects
 */

import { Project, ProjectType, ProjectStatus } from '@/types/project';
import { Schedule, Task, TaskStatus, Participant, ParticipantRole } from '@/types/schedule';
import { User, UserRole } from '@/types/user';
import { Factory, FactoryType } from '@/types/factory';
import { getTaskTemplatesByFactoryType, calculateTaskDates } from './seeders/tasks/taskTemplates';
import { getTaskStatus, calculateProgress } from './seedHelpers';

export function createSchedulesAndTasks(projects: Project[], users: User[], factories: Factory[]): { schedules: Schedule[], tasks: Task[] } {
  const schedules: Schedule[] = [];
  const tasks: Task[] = [];
  const currentDate = new Date();
  
  // Find specific users for consistent task assignment
  const pmUser = users.find(u => u.role === UserRole.PRODUCT_MANAGER)!;
  const factoryManager = users.find(u => u.role === UserRole.FACTORY_MANAGER)!;
  const qaUser = users.find(u => u.role === UserRole.QA)!;

  projects.forEach((project) => {
    const schedule: Schedule = {
      id: project.id, // Same as project ID for 1:1 relationship
      projectId: project.id,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status === ProjectStatus.IN_PROGRESS ? 'active' : 'draft',
      createdAt: project.createdAt,
      updatedAt: currentDate,
    };
    schedules.push(schedule);

    // Only create tasks for SUB projects
    // Master projects will aggregate tasks from their SUB projects
    if (project.type === ProjectType.SUB) {
      const projectTasks = createTasksForProject(project, schedule.id, pmUser, factoryManager, qaUser, factories);
      tasks.push(...projectTasks);
    }
  });

  return { schedules, tasks };
}

export function createTasksForProject(
  project: Project, 
  scheduleId: string, 
  pmUser: User, 
  factoryManager: User, 
  qaUser: User,
  factories: Factory[]
): Task[] {
  const tasks: Task[] = [];
  
  // Ensure factories is an array
  if (!factories || !Array.isArray(factories)) {
    console.error('Factories parameter is not an array:', factories);
    return tasks;
  }
  
  // Use project's synchronized dates
  const projectStartDate = new Date(project.startDate);
  const projectEndDate = new Date(project.endDate);

  // Collect all factory types and their tasks dynamically
  const projectFactoryTypes: { type: FactoryType; factoryId: string; factory: Factory }[] = [];
  
  // Add manufacturing factory type if exists
  if (project.manufacturerId && typeof project.manufacturerId === 'string') {
    const factory = factories.find(f => f.id === project.manufacturerId);
    if (factory) {
      projectFactoryTypes.push({
        type: FactoryType.MANUFACTURING,
        factoryId: project.manufacturerId,
        factory
      });
    }
  }
  
  // Add container factory type if exists  
  if (project.containerId && typeof project.containerId === 'string') {
    const factory = factories.find(f => f.id === project.containerId);
    if (factory) {
      projectFactoryTypes.push({
        type: FactoryType.CONTAINER,
        factoryId: project.containerId,
        factory
      });
    }
  }
  
  // Add packaging factory type if exists
  if (project.packagingId && typeof project.packagingId === 'string') {
    const factory = factories.find(f => f.id === project.packagingId);
    if (factory) {
      projectFactoryTypes.push({
        type: FactoryType.PACKAGING,
        factoryId: project.packagingId,
        factory
      });
    }
  }

  // Create tasks using template system
  let taskIndex = 0;
  let currentStartDate = new Date(projectStartDate);
  
  projectFactoryTypes.forEach((factoryInfo) => {
    // Get task templates for this factory type
    const templates = getTaskTemplatesByFactoryType(factoryInfo.type);
    const taskDates = calculateTaskDates(templates, currentStartDate);
    
    templates.forEach((template, templateIndex) => {
      const { startDate, endDate } = taskDates[templateIndex];
      
      // Map participant roles to user IDs
      const participants: Participant[] = [];
      if (template.participantRoles.includes('PM')) {
        participants.push({ userId: pmUser.id, role: ParticipantRole.MANAGER });
      }
      if (template.participantRoles.includes('FACTORY_MANAGER')) {
        participants.push({ userId: factoryManager.id, role: ParticipantRole.MEMBER });
      }
      if (template.participantRoles.includes('QA')) {
        participants.push({ userId: qaUser.id, role: ParticipantRole.REVIEWER });
      }
      
      const taskStatus = getTaskStatus(startDate, endDate, project.status);
      
      const task: Task = {
        id: `task-${project.id}-${taskIndex + 1}`,
        scheduleId,
        title: template.title,
        name: template.title, // alias for compatibility
        type: template.type,
        status: taskStatus,
        startDate,
        endDate,
        progress: calculateProgress(taskStatus, startDate, endDate),
        participants,
        factoryId: factoryInfo.factoryId,
        factory: factoryInfo.factory.name,
        priority: template.priority,
        dependsOn: template.dependsOnPrevious && taskIndex > 0 ? [`task-${project.id}-${taskIndex}`] : [],
        blockedBy: [],
        createdAt: project.createdAt,
        updatedAt: new Date(),
      };
      
      tasks.push(task);
      taskIndex++;
    });
    
    // Update start date for next factory type
    if (templates.length > 0) {
      const lastTaskDate = taskDates[taskDates.length - 1].endDate;
      currentStartDate = new Date(lastTaskDate);
      currentStartDate.setDate(currentStartDate.getDate() + 1);
    }
  });

  return tasks;
}