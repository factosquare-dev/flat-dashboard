import { Schedule, Task, TaskStatus, Participant } from '@/types/schedule';
import { Project, ProjectStatus } from '@/types/project';
import { User, UserRole } from '@/types/user';
import { taskTypesByFactoryType } from '@/data/factories';
import { parseDate, toLocalDateString, getTaskStatusByDate } from '@/utils/unifiedDateUtils';

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
      startDate: project.startDate, // Use project's own start date
      endDate: project.endDate,   // Use project's own end date
      status: project.status === ProjectStatus.IN_PROGRESS ? 'active' : 
              project.status === ProjectStatus.COMPLETED ? 'completed' :
              project.status === ProjectStatus.CANCELLED ? 'archived' : 'draft',
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
  
  // Get project timeline - parse UTC dates to local
  const projectStartDate = project.startDate;
  const projectEndDate = project.endDate;

  // Collect factory types
  const projectFactoryTypes: string[] = [];
  if (project.manufacturerId) projectFactoryTypes.push('제조');
  if (project.containerId) projectFactoryTypes.push('용기');
  if (project.packagingId) projectFactoryTypes.push('포장');

  // Create task templates based on project status
  const taskTemplates = createTaskTemplatesForProject(project, projectFactoryTypes, pmUser, factoryManager, qaUser);
  
  // 근본적인 해결: 모든 task를 단순하게 순차적으로 배치
  const totalTasks = taskTemplates.length;
  
  // IN_PROGRESS 프로젝트의 경우, progress에 맞춰 task 날짜 조정
  let adjustedStartDate = new Date(projectStartDate);
  if (project.status === ProjectStatus.IN_PROGRESS && project.progress > 0 && totalTasks > 0) {
    const shouldBeCompletedTasks = Math.floor((project.progress / 100) * totalTasks);
    let completedDuration = 0;
    for (let i = 0; i < shouldBeCompletedTasks && i < taskTemplates.length; i++) {
      completedDuration += getTaskDuration(taskTemplates[i].title) + 1;
    }
    const daysToAdjust = completedDuration + 3;
    const calculatedAdjustedDate = new Date(today.getTime() - daysToAdjust * 24 * 60 * 60 * 1000);

    // Ensure adjustedStartDate is not earlier than projectStartDate
    if (calculatedAdjustedDate.getTime() > projectStartDate.getTime()) {
      adjustedStartDate = calculatedAdjustedDate;
    } else {
      adjustedStartDate = new Date(projectStartDate); // Cap it at projectStartDate
    }
  }
  
  let currentDate = new Date(adjustedStartDate);
  
  taskTemplates.forEach((template, index) => {
    // 각 task의 기본 duration 가져오기
    const taskDurationDays = getTaskDuration(template.title);
    const taskDurationMs = taskDurationDays * 24 * 60 * 60 * 1000;
    
    // 시작일과 종료일 설정 (단순하고 명확하게)
    const taskStartDate = new Date(currentDate);
    const taskEndDate = new Date(currentDate.getTime() + taskDurationMs);
    
    // 프로젝트 종료일을 초과하지 않도록 조정
    if (taskEndDate > projectEndDate) {
      taskEndDate.setTime(projectEndDate.getTime());
    }
    
    // Format dates as YYYY-MM-DD strings (local time)
    const taskStartStr = toLocalDateString(taskStartDate);
    const taskEndStr = toLocalDateString(taskEndDate);
    
    // Task 상태 결정 (날짜 기반으로 단순하게)
    let taskStatus: TaskStatus;
    if (project.status === ProjectStatus.CANCELLED) {
      const completedTasks = Math.floor((project.progress / 100) * totalTasks);
      if (index < completedTasks) {
        taskStatus = TaskStatus.COMPLETED;
      } else if (index === completedTasks) {
        taskStatus = TaskStatus.BLOCKED;
      } else {
        taskStatus = TaskStatus.TODO;
      }
    } else {
      // Use utility function for date-based status
      taskStatus = getTaskStatusByDate(taskStartStr, taskEndStr, project.status);
    }
    
    const task: Task = {
      id: `task-${project.id}-${index + 1}`,
      scheduleId,
      title: template.title,
      type: template.type as any,
      status: taskStatus,
      startDate: taskStartStr,
      endDate: taskEndStr,
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
      
      // Frontend convenience fields
      projectId: project.id,  // Quick access to project
      name: template.title,   // Alias for title
      assigneeId: template.participants[0], // Primary assignee
      assignee: template.participants.length > 0 ? 
        (template.participants[0] === pmUser.id ? pmUser.name :
         template.participants[0] === factoryManager.id ? factoryManager.name :
         template.participants[0] === qaUser.id ? qaUser.name : '담당자') : undefined,
    };

    // Add completion date for completed tasks
    if (taskStatus === TaskStatus.COMPLETED) {
      task.completedAt = new Date(taskEndDate);
      task.approvedBy = pmUser.id;
      task.approvedAt = new Date(taskEndDate);
    }

    tasks.push(task);
    
    // 중요: 다음 task의 시작일을 현재 task의 종료일 다음날로 설정 (1일 간격)
    currentDate = new Date(taskEndDate.getTime() + 24 * 60 * 60 * 1000);
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


// 더 이상 필요하지 않은 복잡한 함수들 제거됨
// Task 생성 로직이 단순화되어 createTasksForProject 함수에 통합됨

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