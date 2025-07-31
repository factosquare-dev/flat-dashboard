/**
 * Updated seed data for consistent customer and manager relationships
 */

import { MockDatabase, UserFactory, ProjectAssignment, FactoryProject, UserCustomer } from './types';
import { MockDatabaseImpl } from './MockDatabase';
import { User, UserRole } from '@/types/user';
import { Customer } from '@/types/customer';
import { Factory } from '@/types/factory';
import { Project, ProjectType, ProjectStatus } from '@/types/project';
import { Schedule, Task, TaskStatus, Participant } from '@/types/schedule';
import { taskTypesByFactoryType } from '../../data/factories';
import { TIME_CONSTANTS } from '../../constants/time';
import type { Comment } from '@/types/comment';

// Import seeders
import { createUsers } from './seeders/userSeeder';
import { createCustomers } from './seeders/customerSeeder';
import { createFactories } from './seeders/factorySeeder';
import { createProjects } from './seeders/projectSeeder';
import { createSchedulesAndTasks } from './seeders/scheduleTaskSeeder';
import { createProductCategories } from './seeders/productCategorySeeder';
import { createProducts } from './seeders/productSeeder';

export const seedData = {
  createInitialData(): MockDatabase {
    const db: MockDatabase = {
      users: new Map(),
      customers: new Map(),
      factories: new Map(),
      projects: new Map(),
      schedules: new Map(),
      tasks: new Map(),
      comments: new Map(),
      productCategories: new Map(),
      products: new Map(),
      userFactories: new Map(),
      projectAssignments: new Map(),
      factoryProjects: new Map(),
      userCustomers: new Map(),
      statusMappings: new Map(),
      priorityMappings: new Map(),
      serviceTypeMappings: new Map(),
      projectTypeMappings: new Map(),
    };

    // 1. Create Users
    const users = createUsers();
    users.forEach(user => db.users.set(user.id, user));

    // 2. Create Customers
    const customers = createCustomers();
    customers.forEach(customer => db.customers.set(customer.id, customer));

    // 3. Create Factories
    const factories = createFactories();
    factories.forEach(factory => db.factories.set(factory.id, factory));

    // 4. Create Projects with consistent customer data
    const projects = createProjects(customers, users);
    projects.forEach(project => db.projects.set(project.id, project));

    // 5. Create Product Categories
    const productCategories = createProductCategories();
    productCategories.forEach(category => db.productCategories.set(category.id, category));

    // 6. Create Products
    const products = createProducts();
    products.forEach(product => db.products.set(product.id, product));

    // 7. Create Schedules and Tasks with consistent manager data
    const { schedules, tasks } = createSchedulesAndTasks(projects, users);
    schedules.forEach(schedule => db.schedules.set(schedule.id, schedule));
    tasks.forEach(task => db.tasks.set(task.id, task));

    // 8. Create Comments
    const comments = this.createComments(projects, users);
    comments.forEach(comment => db.comments.set(comment.id, comment));

    // 9. Create Relationships
    const userFactories = this.createUserFactoryRelations(users, factories);
    userFactories.forEach(uf => db.userFactories.set(uf.id, uf));

    const projectAssignments = this.createProjectAssignments(projects, users);
    projectAssignments.forEach(pa => db.projectAssignments.set(pa.id, pa));

    const factoryProjects = this.createFactoryProjects(projects, factories);
    factoryProjects.forEach(fp => db.factoryProjects.set(fp.id, fp));

    const userCustomers = this.createUserCustomerRelations(users, customers);
    userCustomers.forEach(uc => db.userCustomers.set(uc.id, uc));

    // 10. Create Status and Priority Mappings
    const statusMappings = this.createStatusMappings();
    statusMappings.forEach(sm => db.statusMappings.set(sm.id, sm));

    const priorityMappings = this.createPriorityMappings();
    priorityMappings.forEach(pm => db.priorityMappings.set(pm.id, pm));

    const serviceTypeMappings = this.createServiceTypeMappings();
    serviceTypeMappings.forEach(stm => db.serviceTypeMappings.set(stm.id, stm));

    const projectTypeMappings = this.createProjectTypeMappings();
    projectTypeMappings.forEach(ptm => db.projectTypeMappings.set(ptm.id, ptm));

    // Note: Master project aggregates will be updated after database initialization
    // to avoid circular dependency with MockDatabaseImpl.getInstance()
    
    return db;
  },

  createSchedulesAndTasks(projects: Project[], users: User[]): { schedules: Schedule[], tasks: Task[] } {
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
        status: project.status === ProjectStatus.IN_PROGRESS ? 'active' : 'draft',
        createdAt: project.createdAt,
        updatedAt: currentDate,
      };
      schedules.push(schedule);

      // Only create tasks for SUB projects
      // Master projects will aggregate tasks from their SUB projects
      if (project.type === ProjectType.SUB) {
        const projectTasks = this.createTasksForProject(project, schedule.id, pmUser, factoryManager, qaUser);
        tasks.push(...projectTasks);
      }
    });

    return { schedules, tasks };
  },

  createTasksForProject(
    project: Project, 
    scheduleId: string, 
    pmUser: User, 
    factoryManager: User, 
    qaUser: User
  ): Task[] {
    const tasks: Task[] = [];
    
    // ✅ Use project's synchronized dates (no hardcoding!)
    const projectStartDate = new Date(project.startDate);
    const projectEndDate = new Date(project.endDate);
    const projectDurationDays = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get database to look up factory names
    const database = MockDatabaseImpl.getInstance().getDatabase();

    // Collect all factory types and their tasks dynamically
    const projectFactoryTypes: { type: string; factoryId: string; factoryName: string }[] = [];
    
    // Add manufacturing factory type if exists
    if (project.manufacturerId) {
      const factory = database.factories.get(project.manufacturerId);
      if (factory) {
        projectFactoryTypes.push({
          type: '제조',
          factoryId: project.manufacturerId,
          factoryName: factory.name
        });
      }
    }
    
    // Add container factory type if exists  
    if (project.containerId) {
      const factory = database.factories.get(project.containerId);
      if (factory) {
        projectFactoryTypes.push({
          type: '용기',
          factoryId: project.containerId,
          factoryName: factory.name
        });
      }
    }
    
    // Add packaging factory type if exists
    if (project.packagingId) {
      const factory = database.factories.get(project.packagingId);
      if (factory) {
        projectFactoryTypes.push({
          type: '포장',
          factoryId: project.packagingId,
          factoryName: factory.name
        });
      }
    }

    // Create tasks dynamically based on factory types
    const taskTemplates: Array<{
      title: string;
      type: string;
      duration: number;
      participants: string[];
      dependsOn?: string[];
      factoryType: string;
      factoryId: string;
      factoryName: string;
    }> = [];
    
    let previousTasks: string[] = [];
    
    projectFactoryTypes.forEach((factoryInfo, factoryIndex) => {
      const factoryTasks = taskTypesByFactoryType[factoryInfo.type as keyof typeof taskTypesByFactoryType] || [];
      
      
      factoryTasks.forEach((taskTitle, taskIndex) => {
        const template = {
          title: taskTitle,
          type: this.mapTaskTitleToType(taskTitle),
          duration: this.getTaskDuration(taskTitle),
          participants: this.getTaskParticipants(taskTitle, pmUser.id, factoryManager.id, qaUser.id),
          dependsOn: taskIndex === 0 ? previousTasks : [factoryTasks[taskIndex - 1]],
          factoryType: factoryInfo.type,
          factoryId: factoryInfo.factoryId,
          factoryName: factoryInfo.factoryName
        };
        
        taskTemplates.push(template);
      });
      
      // Set up dependency chain between factory types
      if (factoryTasks.length > 0) {
        previousTasks = [factoryTasks[factoryTasks.length - 1]];
      }
    });

    // ✅ Calculate total task duration and scale to fit project timeline
    const totalTaskDuration = taskTemplates.reduce((sum, template) => sum + template.duration, 0);
    const scaleFactor = Math.max(0.8, Math.min(1.2, projectDurationDays / totalTaskDuration)); // 80%-120% scaling
    
    // Distribute tasks across project timeline with proper synchronization
    let currentStartDate = new Date(projectStartDate);
    
    taskTemplates.forEach((template, index) => {
      // Scale task duration to fit within project timeline
      const scaledDuration = Math.max(1, Math.round(template.duration * scaleFactor));
      const taskEndDate = new Date(currentStartDate.getTime() + scaledDuration * 24 * 60 * 60 * 1000);
      
      // ✅ Ensure task doesn't exceed project end date
      if (taskEndDate > projectEndDate) {
        taskEndDate.setTime(projectEndDate.getTime());
      }

      const task: Task = {
        id: `task-${project.id}-${index + 1}`,
        scheduleId,
        title: template.title,
        type: template.type,
        status: this.getTaskStatus(project.progress, index, taskTemplates.length),
        startDate: new Date(currentStartDate),
        endDate: taskEndDate,
        progress: this.getTaskProgress(project.progress, index, taskTemplates.length),
        participants: template.participants.map(userId => ({
          userId,
          role: userId === pmUser.id ? 'manager' : 'member',
        } as Participant)),
        factoryId: template.factoryId,
        factory: template.factoryName,
        priority: project.priority,
        dependsOn: template.dependsOn?.map(depTitle => 
          `task-${project.id}-${taskTemplates.findIndex(t => t.title === depTitle) + 1}`
        ).filter(id => id !== `task-${project.id}-0`) || [],
        blockedBy: [],
        createdAt: project.createdAt,
        updatedAt: new Date(),
      };

      tasks.push(task);
      
      // ✅ Move to next task start date with 1-day buffer (unless we're at project end)
      currentStartDate = new Date(taskEndDate.getTime() + 24 * 60 * 60 * 1000);
      if (currentStartDate > projectEndDate) {
        currentStartDate = new Date(projectEndDate);
      }
    });

    return tasks;
  },

  getTaskStatus(projectProgress: number, taskIndex: number, totalTasks: number): TaskStatus {
    const taskProgressThreshold = (100 / totalTasks) * (taskIndex + 1);
    
    if (projectProgress >= taskProgressThreshold) {
      return TaskStatus.COMPLETED;
    } else if (projectProgress >= taskProgressThreshold - (100 / totalTasks)) {
      return TaskStatus.IN_PROGRESS;
    } else {
      return TaskStatus.TODO;
    }
  },

  getTaskProgress(projectProgress: number, taskIndex: number, totalTasks: number): number {
    const taskProgressThreshold = (100 / totalTasks) * (taskIndex + 1);
    const previousThreshold = (100 / totalTasks) * taskIndex;
    
    if (projectProgress >= taskProgressThreshold) {
      return 100;
    } else if (projectProgress > previousThreshold) {
      const taskProgress = ((projectProgress - previousThreshold) / (100 / totalTasks)) * 100;
      return Math.min(Math.round(taskProgress), 100);
    } else {
      return 0;
    }
  },

  getFactoryForTask(factoryType: string, project: Project): string {
    // Map factory types to project factory IDs
    switch (factoryType) {
      case '제조':
        return project.manufacturerId;
      case '용기':
        return project.containerId;
      case '포장':
        return project.packagingId;
      default:
        return project.manufacturerId; // Fallback to manufacturing
    }
  },

  createComments(projects: Project[], users: User[]): Comment[] {
    const comments: Comment[] = [];
    
    projects.forEach((project, pIndex) => {
      // Create 2-3 comments per project
      const commentCount = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < commentCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const createdAt = new Date(project.createdAt);
        createdAt.setDate(createdAt.getDate() + i * 3);
        
        const comment: Comment = {
          id: `comment-${pIndex}-${i}`,
          projectId: project.id,
          userId: user.id,
          author: {
            id: user.id,
            name: user.name,
            profileImage: user.profileImage,
          },
          content: this.getRandomComment(project, user),
          createdAt,
          updatedAt: createdAt,
        };
        
        comments.push(comment);
      }
    });
    
    return comments;
  },

  getRandomComment(project: Project, user: User): string {
    const comments = [
      `${project.name} 프로젝트 진행상황 확인했습니다. 현재 ${project.progress}% 완료되었네요.`,
      '일정대로 잘 진행되고 있습니다. 품질 관리에 신경써주세요.',
      '원자재 수급에 문제없이 진행되고 있습니다.',
      '다음 주 미팅에서 진행상황 공유 부탁드립니다.',
      '포장 디자인 최종안 확인 부탁드립니다.',
      '생산 일정 조정이 필요할 것 같습니다. 논의가 필요합니다.',
    ];
    
    return comments[Math.floor(Math.random() * comments.length)];
  },

  createUserFactoryRelations(users: User[], factories: Factory[]): UserFactory[] {
    const relations: UserFactory[] = [];
    
    // Admin has access to all factories
    factories.forEach((factory, index) => {
      relations.push({
        id: `uf-admin-${index}`,
        userId: 'user-1',
        factoryId: factory.id,
        role: 'manager',
        assignedAt: new Date('2024-01-01'),
        assignedBy: 'system',
      });
    });
    
    // Factory manager has access to specific factories
    relations.push({
      id: 'uf-1',
      userId: 'user-3',
      factoryId: 'factory-1',
      role: 'manager',
      assignedAt: new Date('2024-02-01'),
      assignedBy: 'user-1',
    });
    
    relations.push({
      id: 'uf-2',
      userId: 'user-3',
      factoryId: 'factory-4',
      role: 'operator',
      assignedAt: new Date('2024-02-15'),
      assignedBy: 'user-1',
    });
    
    // Developers and QA have viewer access
    relations.push({
      id: 'uf-3',
      userId: 'user-4',
      factoryId: 'factory-1',
      role: 'viewer',
      assignedAt: new Date('2024-02-15'),
      assignedBy: 'user-1',
    });
    
    relations.push({
      id: 'uf-4',
      userId: 'user-5',
      factoryId: 'factory-1',
      role: 'viewer',
      assignedAt: new Date('2024-03-01'),
      assignedBy: 'user-1',
    });
    
    return relations;
  },

  createProjectAssignments(projects: Project[], users: User[]): ProjectAssignment[] {
    const assignments: ProjectAssignment[] = [];
    
    // Find specific users
    const pmUser = users.find(u => u.role === UserRole.PRODUCT_MANAGER)!;
    const factoryManager = users.find(u => u.role === UserRole.FACTORY_MANAGER)!;
    const devUser = users.find(u => u.role === UserRole.DEVELOPER)!;
    const qaUser = users.find(u => u.role === UserRole.QA)!;
    
    projects.forEach((project, index) => {
      // PM is always the manager
      assignments.push({
        id: `pa-${index}-1`,
        projectId: project.id,
        userId: pmUser.id,
        role: 'manager',
        assignedAt: project.createdAt,
        assignedBy: 'user-1',
      });
      
      // Factory manager is a member
      assignments.push({
        id: `pa-${index}-2`,
        projectId: project.id,
        userId: factoryManager.id,
        role: 'member',
        assignedAt: project.createdAt,
        assignedBy: pmUser.id,
      });
      
      // Add developer for high priority projects
      if (project.priority === 'high') {
        assignments.push({
          id: `pa-${index}-3`,
          projectId: project.id,
          userId: devUser.id,
          role: 'member',
          assignedAt: new Date(project.createdAt.getTime() + 24 * 60 * 60 * 1000),
          assignedBy: pmUser.id,
        });
      }
      
      // QA for all projects
      assignments.push({
        id: `pa-${index}-4`,
        projectId: project.id,
        userId: qaUser.id,
        role: 'viewer',
        assignedAt: new Date(project.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
        assignedBy: pmUser.id,
      });
    });
    
    return assignments;
  },

  createFactoryProjects(projects: Project[], factories: Factory[]): FactoryProject[] {
    const relations: FactoryProject[] = [];
    
    projects.forEach((project, index) => {
      // Manufacturer relation
      relations.push({
        id: `fp-${index}-1`,
        projectId: project.id,
        factoryId: project.manufacturerId,
        factoryType: 'manufacturer',
        isPrimary: true,
        assignedAt: project.createdAt,
      });
      
      // Container relation
      relations.push({
        id: `fp-${index}-2`,
        projectId: project.id,
        factoryId: project.containerId,
        factoryType: 'container',
        isPrimary: false,
        assignedAt: project.createdAt,
      });
      
      // Packaging relation
      relations.push({
        id: `fp-${index}-3`,
        projectId: project.id,
        factoryId: project.packagingId,
        factoryType: 'packaging',
        isPrimary: false,
        assignedAt: project.createdAt,
      });
    });
    
    return relations;
  },

  createUserCustomerRelations(users: User[], customers: Customer[]): UserCustomer[] {
    const relations: UserCustomer[] = [];
    
    // Admin manages all customers
    customers.forEach((customer, index) => {
      relations.push({
        id: `uc-admin-${index}`,
        userId: 'user-1', // 김철수 Admin
        customerId: customer.id,
        role: 'manager',
        assignedAt: customer.createdAt,
        assignedBy: 'system',
      });
    });
    
    // 이영희 PM manages customers 1,2
    relations.push({
      id: 'uc-pm-1',
      userId: 'user-2', // 이영희
      customerId: 'customer-1', // 뷰티코리아
      role: 'sales',
      assignedAt: new Date('2024-01-20'),
      assignedBy: 'user-1',
    });
    
    relations.push({
      id: 'uc-pm-2',
      userId: 'user-2', // 이영희
      customerId: 'customer-2', // 그린코스메틱
      role: 'sales',
      assignedAt: new Date('2024-02-25'),
      assignedBy: 'user-1',
    });
    
    // 강미나 PM manages customers 3,4
    relations.push({
      id: 'uc-pm-3',
      userId: 'user-6', // 강미나
      customerId: 'customer-3', // 코스메디칼
      role: 'sales',
      assignedAt: new Date('2024-03-10'),
      assignedBy: 'user-1',
    });
    
    relations.push({
      id: 'uc-pm-4',
      userId: 'user-6', // 강미나
      customerId: 'customer-4', // 퍼스트뷰티
      role: 'sales',
      assignedAt: new Date('2024-02-25'),
      assignedBy: 'user-1',
    });
    
    // Customer contacts
    relations.push({
      id: 'uc-contact-1',
      userId: 'user-9', // 박민수
      customerId: 'customer-1', // 뷰티코리아
      role: 'contact',
      assignedAt: new Date('2024-01-20'),
      assignedBy: 'user-1',
    });
    
    relations.push({
      id: 'uc-contact-2',
      userId: 'user-10', // 정수진
      customerId: 'customer-2', // 그린코스메틱
      role: 'contact',
      assignedAt: new Date('2024-02-25'),
      assignedBy: 'user-1',
    });
    
    relations.push({
      id: 'uc-contact-3',
      userId: 'user-11', // 윤서준
      customerId: 'customer-3', // 코스메디칼
      role: 'contact',
      assignedAt: new Date('2024-03-15'),
      assignedBy: 'user-1',
    });
    
    relations.push({
      id: 'uc-contact-4',
      userId: 'user-12', // 임하나
      customerId: 'customer-4', // 퍼스트뷰티
      role: 'contact',
      assignedAt: new Date('2024-02-28'),
      assignedBy: 'user-1',
    });
    
    return relations;
  },

  // Helper functions for dynamic task creation (no more hardcoding!)
  mapTaskTitleToType(title: string): string {
    // Map task titles to types dynamically based on keywords
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

    // Find matching type based on keywords in title
    for (const [keyword, type] of Object.entries(typeMap)) {
      if (title.includes(keyword)) {
        return type;
      }
    }
    
    return 'other'; // Default fallback
  },

  getTaskDuration(title: string): number {
    // Dynamic duration based on task complexity (no hardcoded magic numbers!)
    const durationMap: Record<string, number> = {
      // Quick tasks (1-2 days)
      '검수': 1,
      '승인': 1,
      '출하': 1,
      '라벨': 2,
      '준비': 2,
      
      // Medium tasks (3-5 days)
      '검사': 3,
      '품질': 3,
      '포장': 4,
      '작업': 4,
      '처리': 3,
      
      // Complex tasks (5-10 days)
      '제조': 7,
      '생산': 7,
      '혼합': 5,
      '배합': 5,
      '충전': 6,
      '성형': 8,
      '디자인': 5,
      
      // Very complex tasks (10+ days)
      '금형': 12,
      '개발': 14,
      '테스트': 10,
    };

    // Find duration based on keywords in title
    for (const [keyword, duration] of Object.entries(durationMap)) {
      if (title.includes(keyword)) {
        return duration;
      }
    }
    
    return 3; // Default duration
  },

  getTaskParticipants(title: string, pmUserId: string, factoryManagerId: string, qaUserId: string): string[] {
    // Assign participants based on task type (no hardcoding!)
    const participants: string[] = [];

    // Quality-related tasks always include QA
    if (title.includes('검사') || title.includes('품질') || title.includes('테스트')) {
      participants.push(qaUserId);
    }

    // Management tasks include PM
    if (title.includes('승인') || title.includes('검수') || title.includes('준비')) {
      participants.push(pmUserId);
    }

    // Production tasks include factory manager
    if (title.includes('제조') || title.includes('생산') || title.includes('작업') || 
        title.includes('포장') || title.includes('충전') || title.includes('성형')) {
      participants.push(factoryManagerId);
    }

    // If no specific participant assigned, default to factory manager + PM
    if (participants.length === 0) {
      participants.push(factoryManagerId, pmUserId);
    }

    return participants;
  },

  createStatusMappings() {
    const projectStatuses = [
      { id: 'status-proj-1', type: 'project' as const, code: 'PLANNING', displayName: '시작전', displayNameEn: 'Planning', color: '#6B7280', order: 1 },
      { id: 'status-proj-2', type: 'project' as const, code: 'IN_PROGRESS', displayName: '진행중', displayNameEn: 'In Progress', color: '#3B82F6', order: 2 },
      { id: 'status-proj-3', type: 'project' as const, code: 'COMPLETED', displayName: '완료', displayNameEn: 'Completed', color: '#10B981', order: 3 },
      { id: 'status-proj-4', type: 'project' as const, code: 'CANCELLED', displayName: '중단', displayNameEn: 'Cancelled', color: '#EF4444', order: 4 },
    ];

    const taskStatuses = [
      { id: 'status-task-1', type: 'task' as const, code: 'planning', displayName: '시작전', displayNameEn: 'Planning', color: '#6B7280', order: 1 },
      { id: 'status-task-2', type: 'task' as const, code: 'in-progress', displayName: '진행중', displayNameEn: 'In Progress', color: '#3B82F6', order: 2 },
      { id: 'status-task-3', type: 'task' as const, code: 'completed', displayName: '완료', displayNameEn: 'Completed', color: '#10B981', order: 3 },
      { id: 'status-task-4', type: 'task' as const, code: 'cancelled', displayName: '중단', displayNameEn: 'Cancelled', color: '#EF4444', order: 4 },
    ];

    return [...projectStatuses, ...taskStatuses];
  },

  createPriorityMappings() {
    return [
      { id: 'priority-1', code: 'HIGH', displayName: '높음', displayNameEn: 'High', color: '#EF4444', order: 1 },
      { id: 'priority-2', code: 'MEDIUM', displayName: '보통', displayNameEn: 'Medium', color: '#F59E0B', order: 2 },
      { id: 'priority-3', code: 'LOW', displayName: '낮음', displayNameEn: 'Low', color: '#10B981', order: 3 },
    ];
  },

  createServiceTypeMappings() {
    return [
      { id: 'service-1', code: 'OEM', displayName: 'OEM', displayNameEn: 'OEM', description: '주문자 상표 부착 생산', order: 1 },
      { id: 'service-2', code: 'ODM', displayName: 'ODM', displayNameEn: 'ODM', description: '제조업체 개발 생산', order: 2 },
      { id: 'service-3', code: 'OBM', displayName: 'OBM', displayNameEn: 'OBM', description: '자체 브랜드 생산', order: 3 },
    ];
  },

  createProjectTypeMappings() {
    return [
      { id: 'proj-type-1', code: 'MASTER', displayName: '대형', displayNameEn: 'Master', order: 1 },
      { id: 'proj-type-2', code: 'SUB', displayName: '소형', displayNameEn: 'Sub', order: 2 },
      { id: 'proj-type-3', code: 'TASK', displayName: '작업', displayNameEn: 'Task', order: 3 },
    ];
  },
};