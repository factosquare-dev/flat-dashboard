/**
 * Mock Data Service
 * 중앙집중식 데이터 관리를 위한 서비스
 * 모든 하드코딩된 데이터를 Mock DB를 통해 관리
 */

import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import { FACTORY_TYPES, TASK_TYPES } from '../constants/factory';
import type { Factory } from '../types/factory';
import type { Task } from '../types/schedule';
import type { Project } from '../types/project';

class MockDataService {
  private db: MockDatabaseImpl;

  constructor() {
    this.db = MockDatabaseImpl.getInstance();
  }

  /**
   * Factory 관련 메서드
   */
  
  // 모든 공장 가져오기
  getAllFactories(): Factory[] {
    const database = this.db.getDatabase();
    return Array.from(database.factories.values());
  }

  // 타입별 공장 가져오기
  getFactoriesByType(type: string): Factory[] {
    const factories = this.getAllFactories();
    return factories.filter(f => f.type === type);
  }

  // ID로 공장 가져오기
  getFactoryById(id: string): Factory | undefined {
    const database = this.db.getDatabase();
    return database.factories.get(id);
  }

  // 공장 ID로 태스크 타입 가져오기
  getTaskTypesForFactory(factoryId: string): string[] {
    const factory = this.getFactoryById(factoryId);
    if (!factory) return [];

    // 공장 타입에 따른 태스크 타입 반환
    switch (factory.type) {
      case FACTORY_TYPES.MANUFACTURING:
        return Object.values(TASK_TYPES.MANUFACTURING);
      case FACTORY_TYPES.CONTAINER:
        return Object.values(TASK_TYPES.CONTAINER);
      case FACTORY_TYPES.PACKAGING:
        return Object.values(TASK_TYPES.PACKAGING);
      default:
        return [];
    }
  }

  /**
   * Task 관련 메서드
   */
  
  // 프로젝트의 모든 태스크 가져오기
  getTasksByProjectId(projectId: string): Task[] {
    const database = this.db.getDatabase();
    const tasks = Array.from(database.tasks.values());
    return tasks.filter(task => {
      // schedule을 통해 projectId 매칭
      const schedule = Array.from(database.schedules.values()).find(
        s => s.id === task.scheduleId
      );
      return schedule?.projectId === projectId;
    });
  }

  // 공장별 태스크 가져오기
  getTasksByFactoryId(factoryId: string): Task[] {
    const database = this.db.getDatabase();
    const tasks = Array.from(database.tasks.values());
    return tasks.filter(task => task.factoryId === factoryId);
  }

  /**
   * Project 관련 메서드
   */
  
  // 모든 프로젝트 가져오기
  getAllProjects(): Project[] {
    const database = this.db.getDatabase();
    return Array.from(database.projects.values());
  }

  // 프로젝트에 할당된 공장 가져오기
  getFactoriesForProject(projectId: string): Factory[] {
    const project = this.db.getDatabase().projects.get(projectId);
    if (!project) return [];

    const factories: Factory[] = [];
    
    if (project.manufacturerId) {
      const factory = this.getFactoryById(project.manufacturerId);
      if (factory) factories.push(factory);
    }
    
    if (project.containerId) {
      const factory = this.getFactoryById(project.containerId);
      if (factory) factories.push(factory);
    }
    
    if (project.packagingId) {
      const factory = this.getFactoryById(project.packagingId);
      if (factory) factories.push(factory);
    }

    return factories;
  }

  /**
   * 담당자 관련 메서드
   */
  
  // 공장 ID로 담당자 가져오기
  getAssigneeForFactoryId(factoryId: string): string {
    const factory = this.getFactoryById(factoryId);
    if (factory?.manager) {
      return factory.manager.name;
    }
    
    // Fallback: 랜덤 매니저
    const database = this.db.getDatabase();
    const users = Array.from(database.users.values());
    const managers = users.filter(u => u.role === 'PRODUCT_MANAGER');
    
    if (managers.length > 0) {
      const randomIndex = Math.floor(Math.random() * managers.length);
      return managers[randomIndex].name;
    }
    
    return '담당자 미정';
  }

  /**
   * 유틸리티 메서드
   */
  
  // Mock DB 초기화
  resetDatabase(): void {
    // localStorage 클리어
    localStorage.removeItem('mockDb');
    // DB 재초기화
    location.reload();
  }

  // 데이터 저장 (영구 저장)
  saveDatabase(): void {
    this.db.save();
  }
}

// 싱글톤 인스턴스
export const mockDataService = new MockDataService();