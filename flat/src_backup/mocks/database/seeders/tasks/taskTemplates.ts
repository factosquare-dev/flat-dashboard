import { TaskType, Priority, FactoryType } from '@/types/enums';

export interface TaskTemplate {
  title: string;
  type: TaskType;
  duration: number; // days
  priority: Priority;
  participantRoles: string[]; // roles that should participate
  dependsOnPrevious: boolean; // depends on the previous task in sequence
}

export interface FactoryTaskTemplate {
  factoryType: FactoryType;
  tasks: TaskTemplate[];
}

// Task templates for each factory type
export const factoryTaskTemplates: FactoryTaskTemplate[] = [
  {
    factoryType: FactoryType.MANUFACTURING,
    tasks: [
      {
        title: '제품 설계 검토',
        type: TaskType.DESIGN,
        duration: 3,
        priority: Priority.HIGH,
        participantRoles: ['PM', 'FACTORY_MANAGER'],
        dependsOnPrevious: false
      },
      {
        title: '원자재 소싱',
        type: TaskType.SOURCING,
        duration: 5,
        priority: Priority.HIGH,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: false
      },
      {
        title: '생산 라인 준비',
        type: TaskType.PREPARATION,
        duration: 2,
        priority: Priority.MEDIUM,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      },
      {
        title: '시제품 제작',
        type: TaskType.PROTOTYPING,
        duration: 4,
        priority: Priority.HIGH,
        participantRoles: ['FACTORY_MANAGER', 'QA'],
        dependsOnPrevious: true
      },
      {
        title: '품질 검사',
        type: TaskType.QUALITY_CHECK,
        duration: 2,
        priority: Priority.HIGH,
        participantRoles: ['QA'],
        dependsOnPrevious: true
      },
      {
        title: '대량 생산',
        type: TaskType.PRODUCTION,
        duration: 10,
        priority: Priority.MEDIUM,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      },
      {
        title: '최종 품질 검사',
        type: TaskType.QUALITY_CHECK,
        duration: 2,
        priority: Priority.HIGH,
        participantRoles: ['QA'],
        dependsOnPrevious: true
      }
    ]
  },
  {
    factoryType: FactoryType.CONTAINER,
    tasks: [
      {
        title: '용기 디자인 확정',
        type: TaskType.DESIGN,
        duration: 2,
        priority: Priority.HIGH,
        participantRoles: ['PM', 'FACTORY_MANAGER'],
        dependsOnPrevious: false
      },
      {
        title: '금형 제작',
        type: TaskType.MOLD_MAKING,
        duration: 7,
        priority: Priority.HIGH,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      },
      {
        title: '시제품 사출',
        type: TaskType.PROTOTYPING,
        duration: 3,
        priority: Priority.HIGH,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      },
      {
        title: '용기 품질 테스트',
        type: TaskType.QUALITY_CHECK,
        duration: 2,
        priority: Priority.HIGH,
        participantRoles: ['QA'],
        dependsOnPrevious: true
      },
      {
        title: '대량 생산',
        type: TaskType.PRODUCTION,
        duration: 8,
        priority: Priority.MEDIUM,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      },
      {
        title: '용기 검수',
        type: TaskType.INSPECTION,
        duration: 1,
        priority: Priority.MEDIUM,
        participantRoles: ['QA'],
        dependsOnPrevious: true
      }
    ]
  },
  {
    factoryType: FactoryType.PACKAGING,
    tasks: [
      {
        title: '포장 디자인 승인',
        type: TaskType.DESIGN,
        duration: 2,
        priority: Priority.MEDIUM,
        participantRoles: ['PM'],
        dependsOnPrevious: false
      },
      {
        title: '인쇄 판 제작',
        type: TaskType.PRINTING_PLATE,
        duration: 3,
        priority: Priority.HIGH,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      },
      {
        title: '시험 인쇄',
        type: TaskType.PROTOTYPING,
        duration: 1,
        priority: Priority.MEDIUM,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      },
      {
        title: '색상 교정',
        type: TaskType.COLOR_CORRECTION,
        duration: 1,
        priority: Priority.HIGH,
        participantRoles: ['FACTORY_MANAGER', 'PM'],
        dependsOnPrevious: true
      },
      {
        title: '본 인쇄',
        type: TaskType.PRINTING,
        duration: 5,
        priority: Priority.MEDIUM,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      },
      {
        title: '후가공',
        type: TaskType.POST_PROCESSING,
        duration: 3,
        priority: Priority.LOW,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      },
      {
        title: '포장 완료',
        type: TaskType.PACKING,
        duration: 2,
        priority: Priority.LOW,
        participantRoles: ['FACTORY_MANAGER'],
        dependsOnPrevious: true
      }
    ]
  }
];

// Helper function to get task templates by factory type
export function getTaskTemplatesByFactoryType(factoryType: FactoryType): TaskTemplate[] {
  const template = factoryTaskTemplates.find(t => t.factoryType === factoryType);
  return template?.tasks || [];
}

// TASK-CENTRIC: Get ALL task templates for a project
export function getAllTaskTemplates(): TaskTemplate[] {
  const allTasks: TaskTemplate[] = [];
  
  // Collect all tasks from all factory types
  factoryTaskTemplates.forEach(template => {
    allTasks.push(...template.tasks);
  });
  
  return allTasks;
}

// Helper function to calculate task dates based on project start date and dependencies
export function calculateTaskDates(
  templates: TaskTemplate[], 
  projectStartDate: Date
): { startDate: Date; endDate: Date }[] {
  const taskDates: { startDate: Date; endDate: Date }[] = [];
  let currentDate = new Date(projectStartDate);

  templates.forEach((template, index) => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + template.duration - 1);

    taskDates.push({ startDate, endDate });

    // If next task depends on this one, update current date
    if (index < templates.length - 1 && templates[index + 1].dependsOnPrevious) {
      currentDate = new Date(endDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return taskDates;
}

// Helper function to get priority color
export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.HIGH:
      return '#ef4444'; // red
    case Priority.MEDIUM:
      return '#f59e0b'; // amber
    case Priority.LOW:
      return '#10b981'; // emerald
    default:
      return '#6b7280'; // gray
  }
}

// Helper function to get priority label in Korean
export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case Priority.HIGH:
      return '높음';
    case Priority.MEDIUM:
      return '보통';
    case Priority.LOW:
      return '낮음';
    default:
      return '없음';
  }
}