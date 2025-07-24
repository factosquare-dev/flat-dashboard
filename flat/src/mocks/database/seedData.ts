/**
 * Updated seed data for consistent customer and manager relationships
 */

import { MockDatabase, UserFactory, ProjectAssignment, FactoryProject, UserCustomer } from './types';
import { User, UserRole } from '@/types/user';
import { Customer } from '@/types/customer';
import { Factory } from '@/types/factory';
import { Project, ProjectType, ProjectStatus } from '@/types/project';
import { Schedule, Task, TaskStatus, Participant } from '@/types/schedule';
import type { Comment } from '@/types/comment';

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
      userFactories: new Map(),
      projectAssignments: new Map(),
      factoryProjects: new Map(),
      userCustomers: new Map(),
    };

    // 1. Create Users
    const users = this.createUsers();
    users.forEach(user => db.users.set(user.id, user));

    // 2. Create Customers
    const customers = this.createCustomers();
    customers.forEach(customer => db.customers.set(customer.id, customer));

    // 3. Create Factories
    const factories = this.createFactories();
    factories.forEach(factory => db.factories.set(factory.id, factory));

    // 4. Create Projects with consistent customer data
    const projects = this.createProjects(customers, users);
    projects.forEach(project => db.projects.set(project.id, project));

    // 5. Create Schedules and Tasks with consistent manager data
    const { schedules, tasks } = this.createSchedulesAndTasks(projects, users);
    schedules.forEach(schedule => db.schedules.set(schedule.id, schedule));
    tasks.forEach(task => db.tasks.set(task.id, task));

    // 6. Create Comments
    const comments = this.createComments(projects, users);
    comments.forEach(comment => db.comments.set(comment.id, comment));

    // 7. Create Relationships
    const userFactories = this.createUserFactoryRelations(users, factories);
    userFactories.forEach(uf => db.userFactories.set(uf.id, uf));

    const projectAssignments = this.createProjectAssignments(projects, users);
    projectAssignments.forEach(pa => db.projectAssignments.set(pa.id, pa));

    const factoryProjects = this.createFactoryProjects(projects, factories);
    factoryProjects.forEach(fp => db.factoryProjects.set(fp.id, fp));

    const userCustomers = this.createUserCustomerRelations(users, customers);
    userCustomers.forEach(uc => db.userCustomers.set(uc.id, uc));

    return db;
  },

  createUsers(): User[] {
    return [
      {
        id: 'user-1',
        username: 'admin',
        email: 'kim@example.com',
        name: '김철수',
        role: UserRole.ADMIN,
        position: '팀장',
        department: 'IT팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        permissions: ['all'],
        phoneNumber: '010-1234-5678',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-2',
        username: 'lee_manager',
        email: 'lee@example.com',
        name: '이영희',
        role: UserRole.PRODUCT_MANAGER,
        position: '매니저',
        department: '영업팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee_manager',
        permissions: ['projects.manage', 'factories.view', 'users.view'],
        phoneNumber: '010-2345-6789',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-3',
        username: 'park_factory',
        email: 'park.factory@flat.com',
        name: '박공장',
        role: UserRole.FACTORY_MANAGER,
        position: '공장장',
        department: '생산관리팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=park_factory',
        permissions: ['factories.manage', 'projects.view', 'schedules.manage'],
        phoneNumber: '010-3333-4444',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-4',
        username: 'jung_dev',
        email: 'jung.dev@flat.com',
        name: '정개발',
        role: UserRole.DEVELOPER,
        position: '선임 개발자',
        department: '개발팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jung_dev',
        permissions: ['projects.view', 'schedules.view'],
        phoneNumber: '010-4444-5555',
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-5',
        username: 'choi_admin',
        email: 'choi@example.com',
        name: '최동욱',
        role: UserRole.ADMIN,
        position: '시니어 개발자',
        department: '개발팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=choi_admin',
        permissions: ['all'],
        phoneNumber: '010-5678-9012',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-6',
        username: 'kang_manager',
        email: 'kang@example.com',
        name: '강미나',
        role: UserRole.PRODUCT_MANAGER,
        position: '팀장',
        department: '마케팅팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kang_manager',
        permissions: ['projects.manage', 'factories.view', 'users.view'],
        phoneNumber: '010-6789-0123',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-7',
        username: 'yoon_qa',
        email: 'yoon.qa@flat.com',
        name: '윤품질',
        role: UserRole.QA,
        position: 'QA 매니저',
        department: '품질관리팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yoon_qa',
        permissions: ['projects.view', 'schedules.view', 'qa.manage'],
        phoneNumber: '010-7777-8888',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-8',
        username: 'lim_pm',
        email: 'lim.pm@flat.com',
        name: '임프로',
        role: UserRole.PRODUCT_MANAGER,
        position: '프로덕트 매니저',
        department: '제품관리팀',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lim_customer',
        permissions: ['projects.view'],
        phoneNumber: '010-8901-2345',
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      // 고객사 담당자들 (USER 권한)
      {
        id: 'user-9',
        username: 'park_customer',
        email: 'park@beautykorea.com',
        name: '박민수',
        role: UserRole.USER,
        position: '구매팀장',
        department: '뷰티코리아',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=park_customer',
        permissions: ['projects.view'],
        phoneNumber: '010-3456-7890',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-10',
        username: 'jung_customer',
        email: 'jung@greencosmetic.com',
        name: '정수진',
        role: UserRole.USER,
        position: '제품개발팀 과장',
        department: '그린코스메틱',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jung_customer',
        permissions: ['projects.view'],
        phoneNumber: '010-4567-8901',
        createdAt: new Date('2024-02-25'),
        updatedAt: new Date('2024-02-25'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-11',
        username: 'yoon_customer',
        email: 'yoon@cosmedical.com',
        name: '윤서준',
        role: UserRole.USER,
        position: '연구소장',
        department: '코스메디칼',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yoon_customer',
        permissions: ['projects.view'],
        phoneNumber: '010-7890-1234',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        lastLoginAt: new Date(),
        isActive: true,
      },
      {
        id: 'user-12',
        username: 'lim_customer',
        email: 'lim@firstbeauty.com',
        name: '임하나',
        role: UserRole.USER,
        position: '마케팅팀 차장',
        department: '퍼스트뷰티',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lim_customer',
        permissions: ['projects.view'],
        phoneNumber: '010-8901-2345',
        createdAt: new Date('2024-02-28'),
        updatedAt: new Date('2024-02-28'),
        lastLoginAt: new Date(),
        isActive: true,
      },
    ];
  },

  createCustomers(): Customer[] {
    return [
      {
        id: 'customer-1',
        name: '뷰티코리아',
        companyName: '(주)뷰티코리아',
        contactPerson: '박민수',
        contactNumber: '010-3456-7890',
        email: 'park@beautykorea.com',
        address: '서울시 강남구 테헤란로 123',
        businessNumber: '123-45-67890',
        industry: '화장품',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        createdBy: 'user-1',
        notes: 'VIP 고객사 - 프리미엄 라인 주력'
      },
      {
        id: 'customer-2',
        name: '그린코스메틱',
        companyName: '그린코스메틱(주)',
        contactPerson: '정수진',
        contactNumber: '010-4567-8901',
        email: 'jung@greencosmetic.com',
        address: '경기도 성남시 분당구 판교로 456',
        businessNumber: '234-56-78901',
        industry: '천연화장품',
        isActive: true,
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20'),
        createdBy: 'user-2',
        notes: '친환경 제품 전문'
      },
      {
        id: 'customer-3',
        name: '코스메디칼',
        companyName: '(주)코스메디칼',
        contactPerson: '윤서준',
        contactNumber: '010-7890-1234',
        email: 'yoon@cosmedical.com',
        address: '서울시 송파구 올림픽로 789',
        businessNumber: '345-67-89012',
        industry: '기능성화장품',
        isActive: true,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
        createdBy: 'user-2',
        notes: '의료기기 인증 화장품'
      },
      {
        id: 'customer-4',
        name: '퍼스트뷰티',
        companyName: '퍼스트뷰티(주)',
        contactPerson: '임하나',
        contactNumber: '010-8901-2345',
        email: 'lim@firstbeauty.com',
        address: '경기도 용인시 수지구 신수로 767',
        businessNumber: '456-78-90123',
        industry: '화장품',
        isActive: true,
        createdAt: new Date('2024-02-25'),
        updatedAt: new Date('2024-02-25'),
        createdBy: 'user-1',
        notes: '신규 브랜드 - 젊은층 타겟'
      }
    ];
  },

  createFactories(): Factory[] {
    return [
      {
        id: 'factory-1',
        name: '큐셀시스템',
        type: '제조',
        address: '경기도 성남시 중원구 둔촌대로 388',
        contactNumber: '031-737-3000',
        manager: {
          name: '김철수',
          phone: '010-1234-5678',
          email: 'kim@qcellsystem.com',
        },
        capacity: 100,
        certifications: ['ISO 22716', 'CGMP', 'ISO 9001'],
        establishedDate: new Date('2015-01-01'),
        isActive: true,
      },
      {
        id: 'factory-2',
        name: '(주)연우',
        type: '용기',
        address: '경기도 안산시 단원구 엠티브이25로 58',
        contactNumber: '031-495-8000',
        manager: {
          name: '박용기',
          phone: '010-2345-6789',
          email: 'park@yeonwoo.co.kr',
        },
        capacity: 200,
        certifications: ['ISO 9001', 'ISO 14001'],
        establishedDate: new Date('2010-06-01'),
        isActive: true,
      },
      {
        id: 'factory-3',
        name: '(주)네트모베이지',
        type: '포장',
        address: '인천광역시 남동구 논현로46번길 23',
        contactNumber: '032-812-3456',
        manager: {
          name: '최포장',
          phone: '010-3456-7890',
          email: 'choi@netmobei.com',
        },
        capacity: 150,
        certifications: ['ISO 9001', 'FSC'],
        establishedDate: new Date('2012-03-15'),
        isActive: true,
      },
      {
        id: 'factory-4',
        name: '주식회사 코스모로스',
        type: '제조',
        address: '인천광역시 남동구 남동서로 350',
        contactNumber: '032-812-5000',
        manager: {
          name: '정제조',
          phone: '010-4567-8901',
          email: 'jung@cosmoros.kr',
        },
        capacity: 150,
        certifications: ['ISO 22716', 'CGMP', 'ISO 14001'],
        establishedDate: new Date('2018-01-10'),
        isActive: true,
      },
    ];
  },

  createProjects(customers: Customer[], users: User[]): Project[] {
    const currentDate = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Find specific users for consistency
    const pmUser = users.find(u => u.role === UserRole.PRODUCT_MANAGER)!;
    const customer1 = customers.find(c => c.id === 'customer-1')!;
    const customer2 = customers.find(c => c.id === 'customer-2')!;

    return [
      {
        id: 'project-1',
        projectNumber: 'PRJ-2025-001',
        name: '프리미엄 화장품 라인 A',
        type: ProjectType.MASTER,
        status: ProjectStatus.IN_PROGRESS,
        customerId: customer1.id,
        customer: {
          id: customer1.id,
          name: customer1.name,
          contactPerson: customer1.contactPerson,
          contactNumber: customer1.contactNumber,
          email: customer1.email,
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
        createdBy: pmUser.id,
        createdAt: new Date('2024-12-15'),
        updatedAt: currentDate,
      },
      {
        id: 'project-2',
        projectNumber: 'PRJ-2025-002',
        name: '프리미엄 화장품 라인 A - 선크림',
        type: ProjectType.SUB,
        parentId: 'project-1',
        status: ProjectStatus.PLANNING,
        customerId: customer1.id,
        customer: {
          id: customer1.id, // SUB project inherits MASTER's customer
          name: customer1.name,
          contactPerson: customer1.contactPerson,
          contactNumber: customer1.contactNumber,
          email: customer1.email,
        },
        product: {
          name: '선크림 SPF50+',
          volume: '50ml',
          unitPrice: 25000,
        },
        quantity: 15000,
        totalAmount: 375000000,
        depositAmount: 112500000,
        depositStatus: 'pending',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-04-30'),
        manufacturerId: 'factory-1',
        containerId: 'factory-2',
        packagingId: 'factory-3',
        priority: 'medium',
        progress: 15,
        scheduleId: 'schedule-2',
        createdBy: pmUser.id,
        createdAt: new Date('2025-01-05'),
        updatedAt: currentDate,
      },
      {
        id: 'project-3',
        projectNumber: 'PRJ-2025-003',
        name: '천연 샴푸 시리즈',
        type: ProjectType.MASTER,
        status: ProjectStatus.IN_PROGRESS,
        customerId: customer2.id,
        customer: {
          id: customer2.id,
          name: customer2.name,
          contactPerson: customer2.contactPerson,
          contactNumber: customer2.contactNumber,
          email: customer2.email,
        },
        product: {
          name: '천연 샴푸',
          volume: '500ml',
          unitPrice: 18000,
        },
        quantity: 20000,
        totalAmount: 360000000,
        depositAmount: 108000000,
        depositStatus: 'received',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-02-28'),
        manufacturerId: 'factory-4',
        containerId: 'factory-2',
        packagingId: 'factory-3',
        priority: 'high',
        progress: 60,
        scheduleId: 'schedule-3',
        createdBy: pmUser.id,
        createdAt: new Date('2025-01-10'),
        updatedAt: currentDate,
      },
    ];
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

      // Create tasks for each schedule with consistent manager assignment
      const projectTasks = this.createTasksForProject(project, schedule.id, pmUser, factoryManager, qaUser);
      tasks.push(...projectTasks);
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
    const baseDate = new Date(project.startDate);

    // Define task templates with consistent participant assignment
    const taskTemplates = [
      {
        title: '원료 조달',
        type: 'material' as const,
        duration: 7,
        participants: [factoryManager.id, pmUser.id],
      },
      {
        title: '제품 제조',
        type: 'production' as const,
        duration: 14,
        participants: [factoryManager.id],
        dependsOn: ['원료 조달'],
      },
      {
        title: '품질 검사',
        type: 'quality' as const,
        duration: 3,
        participants: [qaUser.id],
        dependsOn: ['제품 제조'],
      },
      {
        title: '포장 작업',
        type: 'packaging' as const,
        duration: 5,
        participants: [factoryManager.id, pmUser.id],
        dependsOn: ['품질 검사'],
      },
      {
        title: '최종 검수',
        type: 'inspection' as const,
        duration: 2,
        participants: [pmUser.id, qaUser.id],
        dependsOn: ['포장 작업'],
      },
      {
        title: '배송 준비',
        type: 'shipping' as const,
        duration: 1,
        participants: [factoryManager.id],
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
          role: userId === pmUser.id ? 'manager' : 'member',
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
};