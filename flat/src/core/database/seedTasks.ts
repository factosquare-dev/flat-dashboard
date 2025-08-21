/**
 * Task creation for projects - Task-Centric Architecture
 */

import { Project, ProjectType, ProjectStatus } from '@/shared/types/project';
import { Schedule, Task, TaskStatus, Participant, ParticipantRole, FactoryAssignment } from '@/shared/types/schedule';
import { User, UserRole, InternalManagerType } from '@/shared/types/user';
import { Factory, FactoryType } from '@/shared/types/factory';
import { TaskType, FactoryAssignmentRole } from '@/shared/types/enums';
import { getTaskTemplatesByFactoryType, calculateTaskDates, getAllTaskTemplates, TaskTemplate } from './seeders/tasks/taskTemplates';
import { getTaskStatus, calculateProgress } from './seedHelpers';

// Helper function to assign factories to tasks based on task type
function assignFactoriesToTask(
  template: TaskTemplate,
  availableFactories: Factory[],
  taskStatus: TaskStatus,
  startDate: Date,
  endDate: Date
): FactoryAssignment[] {
  const assignments: FactoryAssignment[] = [];
  
  // Special case: 시제품 제작 (Prototyping) - Multiple factories for sampling
  if (template.type === TaskType.PROTOTYPING) {
    // Get all manufacturing factories for sample production
    const manufacturingFactories = availableFactories.filter(f => f.type === FactoryType.MANUFACTURING);
    
    // Assign up to 3 factories for sampling
    const sampleFactories = manufacturingFactories.slice(0, 3);
    
    sampleFactories.forEach((factory, index) => {
      assignments.push({
        factoryId: factory.id,
        factoryName: factory.name,
        factoryType: factory.type,
        role: FactoryAssignmentRole.SAMPLE,
        status: index === 0 ? TaskStatus.IN_PROGRESS : TaskStatus.PENDING,
        progress: index === 0 ? 50 : 0,
        startDate,
        endDate,
        notes: `샘플 ${String.fromCharCode(65 + index)} 제작`
      });
    });
  }
  // Regular tasks - Single factory assignment
  else {
    // Determine which factory type is needed based on task
    let targetFactory: Factory | undefined;
    
    // Packaging tasks - check actual template titles and printing-related tasks
    if (['포장 디자인 승인', '인쇄 판 제작', '시험 인쇄', '색상 교정', '본 인쇄', '후가공', '포장 완료'].includes(template.title) ||
             template.title.includes('포장') || template.title.includes('인쇄') || template.title.includes('색상') || template.title.includes('후가공')) {
      targetFactory = availableFactories.find(f => f.type === FactoryType.PACKAGING);
    }
    // Container tasks - check actual template titles
    else if (['용기 디자인 확정', '금형 제작', '시제품 사출', '용기 품질 테스트', '용기 검수'].includes(template.title) ||
             template.title.includes('용기') || template.title.includes('금형') || template.title.includes('사출')) {
      targetFactory = availableFactories.find(f => f.type === FactoryType.CONTAINER);
    }
    // Manufacturing tasks - all remaining tasks including quality checks
    else if (['제품 설계 검토', '원자재 소싱', '생산 라인 준비', '시제품 제작', '품질 검사', '대량 생산', '최종 품질 검사'].includes(template.title) ||
             template.title.includes('제품') || template.title.includes('생산') || template.title.includes('품질')) {
      targetFactory = availableFactories.find(f => f.type === FactoryType.MANUFACTURING);
    }
    
    if (targetFactory) {
      assignments.push({
        factoryId: targetFactory.id,
        factoryName: targetFactory.name,
        factoryType: targetFactory.type,
        role: FactoryAssignmentRole.PRIMARY,
        status: taskStatus,
        progress: calculateProgress(taskStatus, startDate, endDate),
        startDate,
        endDate
      });
    }
  }
  
  // Don't assign a default factory - tasks should remain unassigned if no appropriate factory exists
  // This ensures packaging tasks don't get assigned to manufacturing factories
  
  return assignments;
}

export function createSchedulesAndTasks(projects: Project[], users: User[], factories: Factory[]): { schedules: Schedule[], tasks: Task[] } {
  const schedules: Schedule[] = [];
  const tasks: Task[] = [];
  const currentDate = new Date();
  
  // Find specific users for consistent task assignment using new role system
  const pmUser = users.find(u => u.role === UserRole.INTERNAL_MANAGER && u.internalManagerType === InternalManagerType.SALES)!;
  const factoryManager = users.find(u => u.role === UserRole.EXTERNAL_MANAGER)!;
  const qaUser = users.find(u => u.role === UserRole.INTERNAL_MANAGER && u.internalManagerType === InternalManagerType.QA)!;

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
  
  // Use project's synchronized dates
  const projectStartDate = new Date(project.startDate);
  const projectEndDate = new Date(project.endDate);

  // TASK-CENTRIC: Get ALL task templates regardless of factories
  const allTemplates = getAllTaskTemplates();
  
  // Calculate dates for all tasks
  const taskDates = calculateTaskDates(allTemplates, projectStartDate);
  
  // Collect available factories for assignment
  const availableFactories: Factory[] = [];
  
  if (project.manufacturerId) {
    const mfg = factories.find(f => f.id === project.manufacturerId);
    if (mfg) availableFactories.push(mfg);
  }
  if (project.containerId) {
    const cont = factories.find(f => f.id === project.containerId);
    if (cont) availableFactories.push(cont);
  }
  if (project.packagingId) {
    const pack = factories.find(f => f.id === project.packagingId);
    if (pack) availableFactories.push(pack);
  }

  // TASK-CENTRIC: Create all tasks first, then assign factories
  allTemplates.forEach((template, taskIndex) => {
    const { startDate, endDate } = taskDates[taskIndex];
    
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
    
    // TASK-CENTRIC: Assign factories based on task type
    const factoryAssignments = assignFactoriesToTask(
      template, 
      availableFactories, 
      taskStatus,
      startDate,
      endDate
    );
    
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
      factoryAssignments, // NEW: Multiple factory assignments
      priority: template.priority,
      dependsOn: template.dependsOnPrevious && taskIndex > 0 ? [`task-${project.id}-${taskIndex}`] : [],
      blockedBy: [],
      createdAt: project.createdAt,
      updatedAt: new Date(),
    };
    
    tasks.push(task);
  });

  return tasks;
}