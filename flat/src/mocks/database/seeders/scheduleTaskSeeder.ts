import { Schedule, Task, TaskStatus, Participant } from '@/types/schedule';
import { Project, ProjectStatus } from '@/types/project';
import { User, UserRole } from '@/types/user';
import { taskTypesByFactoryType } from '../../../data/factories';

export function createSchedulesAndTasks(projects: Project[], users: User[]): { schedules: Schedule[], tasks: Task[] } {
  const schedules: Schedule[] = [];
  const tasks: Task[] = [];
  const currentDate = new Date();
  
  // Find specific users for consistent task assignment
  const pmUser = users.find(u => u.role === UserRole.PRODUCT_MANAGER)!;
  const factoryManager = users.find(u => u.role === UserRole.FACTORY_MANAGER)!;
  const qaUser = users.find(u => u.role === UserRole.QA)!;

  projects.forEach((project, index) => {
    const schedule: Schedule = {
      id: `schedule-${index + 1}`,
      projectId: project.id,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status === ProjectStatus.IN_PROGRESS ? 'active' : 
              project.status === ProjectStatus.COMPLETED ? 'completed' :
              project.status === ProjectStatus.ON_HOLD ? 'archived' : 'draft',
      createdAt: project.createdAt,
      updatedAt: currentDate,
    };
    schedules.push(schedule);

    // Create tasks based on project status
    const projectTasks = createTasksForProject(project, schedule.id, pmUser, factoryManager, qaUser);
    tasks.push(...projectTasks);
  });

  return { schedules, tasks };
}

function createTasksForProject(
  project: Project, 
  scheduleId: string, 
  pmUser: User, 
  factoryManager: User, 
  qaUser: User
): Task[] {
  const tasks: Task[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get project timeline
  const projectStartDate = new Date(project.startDate);
  const projectEndDate = new Date(project.endDate);
  const projectDurationDays = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));

  // Collect factory types
  const projectFactoryTypes: string[] = [];
  if (project.manufacturerId) projectFactoryTypes.push('제조');
  if (project.containerId) projectFactoryTypes.push('용기');
  if (project.packagingId) projectFactoryTypes.push('포장');

  // Create task templates based on project status
  const taskTemplates = createTaskTemplatesForProject(project, projectFactoryTypes, pmUser, factoryManager, qaUser);
  
  // Calculate task positions based on project progress
  let currentStartDate = new Date(projectStartDate);
  const totalTasks = taskTemplates.length;
  
  taskTemplates.forEach((template, index) => {
    // Calculate task timing based on project progress
    const taskTiming = calculateTaskTiming(project, index, totalTasks, projectStartDate, projectEndDate, currentStartDate);
    
    // Determine task status based on project status and progress
    let taskStatus = determineTaskStatus(project, index, totalTasks, taskTiming.startDate, taskTiming.endDate, today);
    
    const task: Task = {
      id: `task-${project.id}-${index + 1}`,
      scheduleId,
      title: template.title,
      type: template.type as any,
      status: taskStatus,
      startDate: taskTiming.startDate,
      endDate: taskTiming.endDate,
      progress: calculateTaskProgress(project, index, totalTasks, taskStatus),
      participants: template.participants.map(userId => ({
        userId,
        role: userId === pmUser.id ? 'manager' : 'member',
      } as Participant)),
      factoryId: getFactoryForTask(template.factoryType, project),
      priority: project.priority,
      dependsOn: template.dependsOn?.map(depTitle => 
        `task-${project.id}-${taskTemplates.findIndex(t => t.title === depTitle) + 1}`
      ).filter(id => id !== `task-${project.id}-0`) || [],
      blockedBy: [],
      createdAt: project.createdAt,
      updatedAt: new Date(),
    };

    // Add completion date for completed tasks
    if (taskStatus === TaskStatus.COMPLETED) {
      task.completedAt = new Date(taskTiming.endDate);
      task.approvedBy = pmUser.id;
      task.approvedAt = new Date(taskTiming.endDate);
    }

    tasks.push(task);
    currentStartDate = new Date(taskTiming.endDate.getTime() + 24 * 60 * 60 * 1000);
  });

  return tasks;
}

function createTaskTemplatesForProject(
  project: Project,
  factoryTypes: string[],
  pmUser: User,
  factoryManager: User,
  qaUser: User
) {
  const templates: any[] = [];
  
  // Different task sets based on project status
  if (project.status === ProjectStatus.PLANNING) {
    // Planning phase tasks only
    templates.push(
      { title: '제품 기획 검토', type: 'other', duration: 3, participants: [pmUser.id], factoryType: '제조' },
      { title: '원료 소싱 검토', type: 'material', duration: 5, participants: [pmUser.id, factoryManager.id], factoryType: '제조' },
      { title: '용기 디자인 기획', type: 'other', duration: 4, participants: [pmUser.id], factoryType: '용기' },
      { title: '포장 디자인 컨셉', type: 'packaging', duration: 3, participants: [pmUser.id], factoryType: '포장' }
    );
  } else {
    // Full production tasks
    factoryTypes.forEach((factoryType) => {
      const factoryTasks = taskTypesByFactoryType[factoryType as keyof typeof taskTypesByFactoryType] || [];
      
      factoryTasks.forEach((taskTitle) => {
        const template = {
          title: taskTitle,
          type: mapTaskTitleToType(taskTitle),
          duration: getTaskDuration(taskTitle),
          participants: getTaskParticipants(taskTitle, pmUser.id, factoryManager.id, qaUser.id),
          factoryType
        };
        templates.push(template);
      });
    });
  }
  
  return templates;
}

function calculateTaskTiming(
  project: Project,
  taskIndex: number,
  totalTasks: number,
  projectStart: Date,
  projectEnd: Date,
  defaultStart: Date
) {
  const projectDuration = projectEnd.getTime() - projectStart.getTime();
  const taskDuration = projectDuration / totalTasks;
  
  // For completed projects, distribute tasks evenly across timeline
  if (project.status === ProjectStatus.COMPLETED) {
    const startOffset = taskDuration * taskIndex;
    const startDate = new Date(projectStart.getTime() + startOffset);
    const endDate = new Date(startDate.getTime() + taskDuration - 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }
  
  // For in-progress projects, calculate based on progress
  if (project.status === ProjectStatus.IN_PROGRESS) {
    const completedTasks = Math.floor((project.progress / 100) * totalTasks);
    
    if (taskIndex < completedTasks) {
      // Completed tasks - distribute in past
      const pastDuration = (new Date().getTime() - projectStart.getTime()) / completedTasks;
      const startDate = new Date(projectStart.getTime() + pastDuration * taskIndex);
      const endDate = new Date(startDate.getTime() + pastDuration - 24 * 60 * 60 * 1000);
      return { startDate, endDate };
    } else if (taskIndex === completedTasks) {
      // Current task - spans today (ensure it's visible in UI)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000); // Started 5 days ago
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // Ends in 7 days
      return { startDate, endDate };
    } else if (taskIndex === completedTasks + 1 && completedTasks < totalTasks - 1) {
      // Next task starts after current task ends (no overlap)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000); // Starts after current task ends
      const endDate = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000); // Ends in 20 days
      return { startDate, endDate };
    } else {
      // Future tasks
      const remainingDuration = projectEnd.getTime() - new Date().getTime();
      const remainingTasks = totalTasks - completedTasks;
      const futureDuration = remainingDuration / remainingTasks;
      const futureIndex = taskIndex - completedTasks;
      const startDate = new Date(new Date().getTime() + futureDuration * futureIndex);
      const endDate = new Date(startDate.getTime() + futureDuration - 24 * 60 * 60 * 1000);
      return { startDate, endDate };
    }
  }
  
  // For ON_HOLD projects, make the current task span today
  if (project.status === ProjectStatus.ON_HOLD) {
    const completedTasks = Math.floor((project.progress / 100) * totalTasks);
    
    if (taskIndex < completedTasks) {
      // Completed tasks - distribute in past
      const elapsedTime = new Date().getTime() - projectStart.getTime();
      const pastDuration = elapsedTime / completedTasks;
      const startDate = new Date(projectStart.getTime() + pastDuration * taskIndex);
      const endDate = new Date(startDate.getTime() + pastDuration - 24 * 60 * 60 * 1000);
      return { startDate, endDate };
    } else if (taskIndex === completedTasks) {
      // Task that was in progress when put on hold - make it span today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000); // Started 10 days ago
      const endDate = new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000); // Would end in 20 days if resumed
      return { startDate, endDate };
    } else {
      // Future tasks - not started yet
      const remainingDuration = projectEnd.getTime() - new Date().getTime();
      const remainingTasks = totalTasks - completedTasks - 1;
      const futureDuration = remainingDuration / Math.max(remainingTasks, 1);
      const futureIndex = taskIndex - completedTasks - 1;
      const startDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000 + futureDuration * futureIndex);
      const endDate = new Date(startDate.getTime() + futureDuration - 24 * 60 * 60 * 1000);
      return { startDate, endDate };
    }
  }
  
  // For other statuses, use default timing
  const duration = 5 * 24 * 60 * 60 * 1000; // 5 days default
  const startDate = new Date(defaultStart);
  const endDate = new Date(startDate.getTime() + duration);
  return { startDate, endDate };
}

function determineTaskStatus(
  project: Project,
  taskIndex: number,
  totalTasks: number,
  taskStart: Date,
  taskEnd: Date,
  today: Date
): TaskStatus {
  // For completed projects, all tasks are completed
  if (project.status === ProjectStatus.COMPLETED) {
    return TaskStatus.COMPLETED;
  }
  
  // For planning projects, all tasks are TODO
  if (project.status === ProjectStatus.PLANNING) {
    return TaskStatus.TODO;
  }
  
  // For on-hold projects, determine based on progress
  if (project.status === ProjectStatus.ON_HOLD) {
    const completedTasks = Math.floor((project.progress / 100) * totalTasks);
    if (taskIndex < completedTasks) {
      return TaskStatus.COMPLETED;
    } else if (taskIndex === completedTasks) {
      return TaskStatus.BLOCKED;
    } else {
      return TaskStatus.TODO;
    }
  }
  
  // For in-progress projects, check if task spans today
  if (project.status === ProjectStatus.IN_PROGRESS) {
    const completedTasks = Math.floor((project.progress / 100) * totalTasks);
    
    if (taskIndex < completedTasks) {
      return TaskStatus.COMPLETED;
    } else if (taskStart <= today && taskEnd >= today) {
      // Task spans today - it's in progress
      return TaskStatus.IN_PROGRESS;
    } else if (taskStart > today) {
      return TaskStatus.TODO;
    } else {
      // Past due but not completed
      return TaskStatus.IN_PROGRESS;
    }
  }
  
  return TaskStatus.TODO;
}

function calculateTaskProgress(
  project: Project,
  taskIndex: number,
  totalTasks: number,
  taskStatus: TaskStatus
): number {
  if (taskStatus === TaskStatus.COMPLETED) {
    return 100;
  }
  
  if (taskStatus === TaskStatus.TODO) {
    return 0;
  }
  
  if (taskStatus === TaskStatus.BLOCKED) {
    // Blocked tasks might have some progress
    return Math.floor(Math.random() * 50) + 20; // 20-70%
  }
  
  // IN_PROGRESS tasks
  if (project.status === ProjectStatus.IN_PROGRESS) {
    const completedTasks = Math.floor((project.progress / 100) * totalTasks);
    if (taskIndex === completedTasks) {
      // Current task - progress based on how far we are
      const taskProgress = ((project.progress % (100 / totalTasks)) / (100 / totalTasks)) * 100;
      return Math.min(Math.max(Math.round(taskProgress), 10), 90); // Between 10-90%
    }
  }
  
  // Default for in-progress
  return Math.floor(Math.random() * 60) + 20; // 20-80%
}

// Helper functions
function mapTaskTitleToType(title: string): string {
  const typeMap: Record<string, string> = {
    '원료': 'material',
    '수령': 'material', 
    '검사': 'quality',
    '품질': 'quality',
    '테스트': 'quality',
    '제조': 'production',
    '생산': 'production',
    '혼합': 'production',
    '배합': 'production',
    '충전': 'production',
    '성형': 'production',
    '포장': 'packaging',
    '라벨': 'packaging',
    '박스': 'packaging',
    '배송': 'shipping',
    '출하': 'shipping',
    '검수': 'inspection',
    '승인': 'inspection',
  };

  for (const [keyword, type] of Object.entries(typeMap)) {
    if (title.includes(keyword)) {
      return type;
    }
  }
  
  return 'other';
}

function getTaskDuration(title: string): number {
  const durationMap: Record<string, number> = {
    '검수': 1,
    '승인': 1,
    '출하': 1,
    '라벨': 2,
    '준비': 2,
    '검사': 3,
    '품질': 3,
    '포장': 4,
    '작업': 4,
    '처리': 3,
    '제조': 7,
    '생산': 7,
    '혼합': 5,
    '배합': 5,
    '충전': 6,
    '성형': 8,
    '디자인': 5,
    '금형': 12,
    '개발': 14,
    '테스트': 10,
  };

  for (const [keyword, duration] of Object.entries(durationMap)) {
    if (title.includes(keyword)) {
      return duration;
    }
  }
  
  return 3;
}

function getTaskParticipants(title: string, pmUserId: string, factoryManagerId: string, qaUserId: string): string[] {
  const participants: string[] = [];

  if (title.includes('검사') || title.includes('품질') || title.includes('테스트')) {
    participants.push(qaUserId);
  }

  if (title.includes('승인') || title.includes('검수') || title.includes('준비')) {
    participants.push(pmUserId);
  }

  if (title.includes('제조') || title.includes('생산') || title.includes('작업') || 
      title.includes('포장') || title.includes('충전') || title.includes('성형')) {
    participants.push(factoryManagerId);
  }

  if (participants.length === 0) {
    participants.push(factoryManagerId, pmUserId);
  }

  return participants;
}

function getFactoryForTask(factoryType: string, project: Project): string {
  switch (factoryType) {
    case '제조':
      return project.manufacturerId;
    case '용기':
      return project.containerId;
    case '포장':
      return project.packagingId;
    default:
      return project.manufacturerId;
  }
}