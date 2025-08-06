/**
 * Seed data relationships - handles creation of all many-to-many relationships
 */

import { UserFactory, ProjectAssignment, FactoryProject, UserCustomer } from './types';
import { User, UserRole } from '@/types/user';
import { Customer } from '@/types/customer';
import { Factory } from '@/types/factory';
import { Project } from '@/types/project';
import { Comment } from '@/types/comment';

export function createUserFactoryRelations(users: User[], factories: Factory[]): UserFactory[] {
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
}

export function createProjectAssignments(projects: Project[], users: User[]): ProjectAssignment[] {
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
}

export function createFactoryProjects(projects: Project[], factories: Factory[]): FactoryProject[] {
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
}

export function createUserCustomerRelations(users: User[], customers: Customer[]): UserCustomer[] {
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
}

export function createComments(projects: Project[], users: User[]): Comment[] {
  const comments: Comment[] = [];
  
  const commentTexts = [
    '{projectName} 프로젝트 진행상황 확인했습니다. 현재 {progress}% 완료되었네요.',
    '일정대로 잘 진행되고 있습니다. 품질 관리에 신경써주세요.',
    '원자재 수급에 문제없이 진행되고 있습니다.',
    '다음 주 미팅에서 진행상황 공유 부탁드립니다.',
    '포장 디자인 최종안 확인 부탁드립니다.',
    '생산 일정 조정이 필요할 것 같습니다. 논의가 필요합니다.',
  ];
  
  projects.forEach((project, pIndex) => {
    // Create 2-3 comments per project
    const commentCount = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < commentCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const createdAt = new Date(project.createdAt);
      createdAt.setDate(createdAt.getDate() + i * 3);
      
      const commentTemplate = commentTexts[Math.floor(Math.random() * commentTexts.length)];
      const content = commentTemplate
        .replace('{projectName}', project.name)
        .replace('{progress}', project.progress.toString());
      
      const comment: Comment = {
        id: `comment-${pIndex}-${i}`,
        projectId: project.id,
        userId: user.id,
        author: {
          id: user.id,
          name: user.name,
          profileImage: user.profileImage,
        },
        content,
        createdAt,
        updatedAt: createdAt,
      };
      
      comments.push(comment);
    }
  });
  
  return comments;
}