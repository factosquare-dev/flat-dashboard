/**
 * Seed Data for Mock Database
 * Provides realistic initial data with proper relationships
 */

import { MockDatabase, UserFactory, ProjectAssignment, FactoryProject } from './types';
import { User, UserRole } from '@/types/user';
import { Factory } from '@/types/factory';
import { Project, ProjectType, ProjectStatus } from '@/types/project';
import { Schedule, Task, TaskStatus, Participant } from '@/types/schedule';
import { Comment } from '@/types/comment';

export const seedData = {
  createInitialData(): MockDatabase {
    const db: MockDatabase = {
      users: new Map(),
      factories: new Map(),
      projects: new Map(),
      schedules: new Map(),
      tasks: new Map(),
      comments: new Map(),
      userFactories: new Map(),
      projectAssignments: new Map(),
      factoryProjects: new Map(),
    };

    // 1. Create Users
    const users = this.createUsers();
    users.forEach(user => db.users.set(user.id, user));

    // 2. Create Factories
    const factories = this.createFactories();
    factories.forEach(factory => db.factories.set(factory.id, factory));

    // 3. Create Projects
    const projects = this.createProjects();
    projects.forEach(project => db.projects.set(project.id, project));

    // 4. Create Schedules and Tasks
    const { schedules, tasks } = this.createSchedulesAndTasks(projects);
    schedules.forEach(schedule => db.schedules.set(schedule.id, schedule));
    tasks.forEach(task => db.tasks.set(task.id, task));

    // 5. Create Comments
    const comments = this.createComments(projects, users);
    comments.forEach(comment => db.comments.set(comment.id, comment));

    // 6. Create Relationships
    const userFactories = this.createUserFactoryRelations(users, factories);
    userFactories.forEach(uf => db.userFactories.set(uf.id, uf));

    const projectAssignments = this.createProjectAssignments(projects, users);
    projectAssignments.forEach(pa => db.projectAssignments.set(pa.id, pa));

    const factoryProjects = this.createFactoryProjects(projects, factories);
    factoryProjects.forEach(fp => db.factoryProjects.set(fp.id, fp));

    return db;
  },

  createUsers(): User[] {
    return [
      {
        id: 'user-1',
        username: 'admin',
        email: 'admin@flat.com',
        name: '시스템 관리자',
        role: UserRole.ADMIN,
        position: 'System Administrator',
        department: 'IT',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        permissions: ['all'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-2',
        username: 'pm_kim',
        email: 'kim.pm@flat.com',
        name: '김프로',
        role: UserRole.PRODUCT_MANAGER,
        position: 'Product Manager',
        department: '제품개발팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pm_kim',
        permissions: ['projects.manage', 'factories.view', 'users.view'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-3',
        username: 'factory_lee',
        email: 'lee.factory@flat.com',
        name: '이공장',
        role: UserRole.FACTORY_MANAGER,
        position: 'Factory Manager',
        department: '생산관리팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=factory_lee',
        permissions: ['factories.manage', 'projects.view', 'schedules.manage'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-4',
        username: 'dev_park',
        email: 'park.dev@flat.com',
        name: '박개발',
        role: UserRole.DEVELOPER,
        position: 'Senior Developer',
        department: '개발팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev_park',
        permissions: ['projects.view', 'schedules.view'],
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-5',
        username: 'qa_choi',
        email: 'choi.qa@flat.com',
        name: '최품질',
        role: UserRole.QA,
        position: 'QA Lead',
        department: '품질관리팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qa_choi',
        permissions: ['projects.view', 'schedules.view', 'qa.manage'],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
        lastLoginAt: new Date(),
        isActive: true,
      },
    ];
  },

  createFactories(): Factory[] {
    return [
      {
        id: 'factory-1',
        name: '서울 제조공장',
        type: '제조',
        address: '서울특별시 강남구 테헤란로 123',
        contactNumber: '02-1234-5678',
        manager: {
          name: '이공장',
          phone: '010-1234-5678',
          email: 'lee.factory@flat.com',
        },
        capacity: 1000,
        certifications: ['ISO 9001', 'HACCP'],
        establishedDate: new Date('2020-01-01'),
        isActive: true,
      },
      {
        id: 'factory-2',
        name: '부산 용기공장',
        type: '용기',
        address: '부산광역시 해운대구 센텀로 456',
        contactNumber: '051-2345-6789',
        manager: {
          name: '김용기',
          phone: '010-2345-6789',
          email: 'kim.container@flat.com',
        },
        capacity: 2000,
        certifications: ['ISO 14001'],
        establishedDate: new Date('2019-06-01'),
        isActive: true,
      },
      {
        id: 'factory-3',
        name: '인천 포장공장',
        type: '포장',
        address: '인천광역시 남동구 산업로 789',
        contactNumber: '032-3456-7890',
        manager: {
          name: '박포장',
          phone: '010-3456-7890',
          email: 'park.packaging@flat.com',
        },
        capacity: 1500,
        certifications: ['ISO 9001', 'ISO 22000'],
        establishedDate: new Date('2021-03-15'),
        isActive: true,
      },
      {
        id: 'factory-4',
        name: '대전 제조공장',
        type: '제조',
        address: '대전광역시 유성구 과학로 321',
        contactNumber: '042-4567-8901',
        manager: {
          name: '정제조',
          phone: '010-4567-8901',
          email: 'jung.manufacturing@flat.com',
        },
        capacity: 800,
        certifications: ['ISO 9001', 'GMP'],
        establishedDate: new Date('2022-01-10'),
        isActive: true,
      },
    ];
  },

  createProjects(): Project[] {
    const currentDate = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return [
      {
        id: 'project-1',
        projectNumber: 'PRJ-2025-001',
        name: '프리미엄 화장품 라인 A',
        type: ProjectType.MASTER,
        status: ProjectStatus.IN_PROGRESS,
        customer: {
          id: 'customer-1',
          name: '뷰티코리아',
          contactPerson: '김미용',
          contactNumber: '02-1111-2222',
          email: 'contact@beautykorea.com',
        },
        product: {
          name: '프리미엄 에센스',
          volume: '50ml',
          unitPrice: 35000,
        },
        quantity: 10000,
        totalAmount: 350000000,
        depositAmount: 105000000,
        depositStatus: 'received',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        manufacturerId: 'factory-1',
        containerId: 'factory-2',
        packagingId: 'factory-3',
        priority: 'high',
        progress: 45,
        scheduleId: 'schedule-1',
        createdBy: 'user-2',
        createdAt: new Date('2024-12-15'),
        updatedAt: currentDate,
      },
      {
        id: 'project-2',
        projectNumber: 'PRJ-2025-002',
        name: '천연 샴푸 시리즈',
        type: ProjectType.SUB,
        parentId: 'project-1',
        status: ProjectStatus.PLANNING,
        customer: {
          id: 'customer-2',
          name: '그린코스메틱',
          contactPerson: '이자연',
          contactNumber: '031-2222-3333',
          email: 'info@greencosmetic.com',
        },
        product: {
          name: '천연 샴푸',
          volume: '500ml',
          unitPrice: 18000,
        },
        quantity: 20000,
        totalAmount: 360000000,
        depositAmount: 108000000,
        depositStatus: 'pending',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-04-30'),
        manufacturerId: 'factory-4',
        containerId: 'factory-2',
        packagingId: 'factory-3',
        priority: 'medium',
        progress: 15,
        scheduleId: 'schedule-2',
        createdBy: 'user-2',
        createdAt: new Date('2025-01-05'),
        updatedAt: currentDate,
      },
      {
        id: 'project-3',
        projectNumber: 'PRJ-2025-003',
        name: '선크림 SPF50+',
        type: ProjectType.TASK,
        parentId: 'project-1',
        status: ProjectStatus.IN_PROGRESS,
        customer: {
          id: 'customer-1',
          name: '뷰티코리아',
          contactPerson: '김미용',
          contactNumber: '02-1111-2222',
          email: 'contact@beautykorea.com',
        },
        product: {
          name: '선크림 SPF50+',
          volume: '50ml',
          unitPrice: 25000,
        },
        quantity: 15000,
        totalAmount: 375000000,
        depositAmount: 112500000,
        depositStatus: 'received',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-02-28'),
        manufacturerId: 'factory-1',
        containerId: 'factory-2',
        packagingId: 'factory-3',
        priority: 'high',
        progress: 60,
        scheduleId: 'schedule-3',
        createdBy: 'user-2',
        createdAt: new Date('2025-01-10'),
        updatedAt: currentDate,
      },
    ];
  },

  createSchedulesAndTasks(projects: Project[]): { schedules: Schedule[], tasks: Task[] } {
    const schedules: Schedule[] = [];
    const tasks: Task[] = [];
    const currentDate = new Date();

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

      // Create tasks for each schedule
      const projectTasks = this.createTasksForProject(project, schedule.id);
      tasks.push(...projectTasks);
    });

    return { schedules, tasks };
  },

  createTasksForProject(project: Project, scheduleId: string): Task[] {
    const tasks: Task[] = [];
    const baseDate = new Date(project.startDate);

    // Define task templates based on project type
    const taskTemplates = [
      {
        title: '원료 조달',
        type: 'material' as const,
        duration: 7,
        participants: ['user-3', 'user-4'],
      },
      {
        title: '제품 제조',
        type: 'production' as const,
        duration: 14,
        participants: ['user-3'],
        dependsOn: ['원료 조달'],
      },
      {
        title: '품질 검사',
        type: 'quality' as const,
        duration: 3,
        participants: ['user-5'],
        dependsOn: ['제품 제조'],
      },
      {
        title: '포장 작업',
        type: 'packaging' as const,
        duration: 5,
        participants: ['user-3', 'user-4'],
        dependsOn: ['품질 검사'],
      },
      {
        title: '최종 검수',
        type: 'inspection' as const,
        duration: 2,
        participants: ['user-2', 'user-5'],
        dependsOn: ['포장 작업'],
      },
      {
        title: '배송 준비',
        type: 'shipping' as const,
        duration: 1,
        participants: ['user-3'],
        dependsOn: ['최종 검수'],
      },
    ];

    let currentStartDate = new Date(baseDate);
    
    taskTemplates.forEach((template, index) => {
      const task: Task = {
        id: `task-${project.id}-${index + 1}`,
        scheduleId,
        title: `${template.title} - ${project.product.name}`,
        type: template.type,
        status: this.getTaskStatus(project.progress, index, taskTemplates.length),
        startDate: new Date(currentStartDate),
        endDate: new Date(currentStartDate.getTime() + template.duration * 24 * 60 * 60 * 1000),
        progress: this.getTaskProgress(project.progress, index, taskTemplates.length),
        participants: template.participants.map(userId => ({
          userId,
          role: userId === 'user-2' ? 'manager' : 'member',
        } as Participant)),
        factoryId: this.getFactoryForTask(template.type, project),
        priority: project.priority,
        dependsOn: template.dependsOn?.map(depTitle => 
          `task-${project.id}-${taskTemplates.findIndex(t => t.title === depTitle) + 1}`
        ).filter(id => id !== `task-${project.id}-0`) || [],
        blockedBy: [],
        createdAt: project.createdAt,
        updatedAt: new Date(),
      };

      tasks.push(task);
      currentStartDate = new Date(task.endDate.getTime() + 24 * 60 * 60 * 1000); // Next day
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

  getFactoryForTask(taskType: string, project: Project): string {
    switch (taskType) {
      case 'production':
      case 'material':
        return project.manufacturerId;
      case 'packaging':
        return project.packagingId;
      default:
        return project.manufacturerId;
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
    
    projects.forEach((project, index) => {
      // PM is always the manager
      assignments.push({
        id: `pa-${index}-1`,
        projectId: project.id,
        userId: 'user-2',
        role: 'manager',
        assignedAt: project.createdAt,
        assignedBy: 'user-1',
      });
      
      // Factory manager is a member
      assignments.push({
        id: `pa-${index}-2`,
        projectId: project.id,
        userId: 'user-3',
        role: 'member',
        assignedAt: project.createdAt,
        assignedBy: 'user-2',
      });
      
      // Add developer for high priority projects
      if (project.priority === 'high') {
        assignments.push({
          id: `pa-${index}-3`,
          projectId: project.id,
          userId: 'user-4',
          role: 'member',
          assignedAt: new Date(project.createdAt.getTime() + 24 * 60 * 60 * 1000),
          assignedBy: 'user-2',
        });
      }
      
      // QA for all projects
      assignments.push({
        id: `pa-${index}-4`,
        projectId: project.id,
        userId: 'user-5',
        role: 'viewer',
        assignedAt: new Date(project.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
        assignedBy: 'user-2',
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
};