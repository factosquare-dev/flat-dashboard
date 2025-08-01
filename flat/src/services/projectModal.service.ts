import type { Comment } from '../types/comment';
import type { User } from '../types/user';
import { UserRole } from '../types/user';
import { MockDatabaseImpl } from '../mocks/database/MockDatabase';

import { ProjectStatus, Priority, ServiceType } from '../types/enums';
import type { ProjectData } from '../components/ProjectModal/types';

export class ProjectModalService {
  /**
   * Get initial form data for create mode
   */
  static getInitialFormData(): ProjectData {
    return {
      client: '',
      manager: '',
      productType: '',
      serviceType: ServiceType.OEM,
      status: ProjectStatus.PLANNING,
      priority: Priority.MEDIUM,
      startDate: '',
      endDate: '',
      manufacturer: '',
      container: '',
      packaging: '',
      sales: '',
      purchase: '',
      description: ''
    };
  }

  /**
   * Get validation rules for project form
   */
  static getValidationRules(formData: ProjectData) {
    return {
      client: { required: true },
      manager: { required: true },
      productType: { required: true },
      serviceType: { required: true },
      startDate: { required: true },
      endDate: { 
        required: true,
        custom: (value: string) => {
          if (value && formData.startDate && value < formData.startDate) {
            return '종료일은 시작일보다 늦어야 합니다';
          }
          return null;
        }
      }
    };
  }
  /**
   * Get all managers from the mock database
   */
  static getManagers(): User[] {
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      const users = Array.from(database.users.values());
      return users.filter(user => 
        user.role === UserRole.PRODUCT_MANAGER || 
        user.role === UserRole.ADMIN ||
        user.role === UserRole.FACTORY_MANAGER
      );
    } catch (error) {
      console.error('Failed to get managers:', error);
      return [];
    }
  }

  /**
   * Get a random manager from the database
   */
  static getRandomManager(): User | null {
    const managers = this.getManagers();
    if (managers.length === 0) return null;
    return managers[Math.floor(Math.random() * managers.length)];
  }

  /**
   * Generate mock comments for a project
   */
  static generateMockComments(projectId: string): Comment[] {
    const manager1 = this.getRandomManager();
    const manager2 = this.getRandomManager();
    
    if (!manager1 || !manager2) return [];
    
    return [
      {
        id: '1',
        content: `이 프로젝트 진행 상황이 궁금합니다. @${manager2.name} 님 확인 부탁드려요.`,
        author: {
          id: manager1.id,
          name: manager1.name,
          avatar: manager1.profileImage || ''
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        projectId: projectId || '',
        mentions: [{
          id: manager2.id,
          name: manager2.name
        }]
      },
      {
        id: '2',
        content: `@${manager1.name} 현재 제조 단계 진행 중입니다. 예정대로 진행되고 있어요.`,
        author: {
          id: manager2.id,
          name: manager2.name,
          avatar: manager2.profileImage || ''
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        parentId: '1',
        projectId: projectId || '',
        mentions: [{
          id: manager1.id,
          name: manager1.name
        }]
      }
    ];
  }

  /**
   * Create a new comment
   */
  static createComment(
    content: string, 
    currentUser: User, 
    projectId: string,
    parentId?: string, 
    mentions?: string[]
  ): Comment {
    return {
      id: Date.now().toString(),
      content,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.profileImage || ''
      },
      createdAt: new Date().toISOString(),
      projectId: projectId || '',
      parentId,
      mentions: mentions ? mentions.map(id => ({ id, name: '사용자' })) : undefined
    };
  }

  /**
   * Update an existing comment
   */
  static updateComment(comment: Comment, newContent: string): Comment {
    return {
      ...comment,
      content: newContent,
      updatedAt: new Date().toISOString()
    };
  }
}