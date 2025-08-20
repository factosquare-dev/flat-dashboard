/**
 * Project-related mock data service methods
 */

import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import type { Project } from '@/shared/types/project';
import type { ProjectId } from '@/shared/types/branded';
import { ProjectType } from '@/shared/types/enums';

export class ProjectDataService {
  private db: MockDatabaseImpl;

  constructor(db: MockDatabaseImpl) {
    this.db = db;
  }

  // 모든 프로젝트 가져오기
  getAllProjects(): Project[] {
    const database = this.db.getDatabase();
    return Array.from(database.projects.values());
  }

  // Master 프로젝트만 가져오기
  getMasterProjects(): Project[] {
    const projects = this.getAllProjects();
    return projects.filter(p => p.type === ProjectType.MASTER);
  }

  // 하위 프로젝트 가져오기
  getChildProjects(parentId: string | ProjectId): Project[] {
    const projects = this.getAllProjects();
    return projects.filter(p => p.parentId === parentId);
  }

  // ID로 프로젝트 가져오기
  getProjectById(id: string | ProjectId): Project | undefined {
    const database = this.db.getDatabase();
    return database.projects.get(id);
  }

  // 프로젝트의 계층 구조 가져오기
  getProjectHierarchy(projectId: string | ProjectId): Project[] {
    const project = this.getProjectById(projectId);
    if (!project) return [];

    const hierarchy: Project[] = [project];
    
    // 부모 프로젝트 찾기
    let currentProject = project;
    while (currentProject.parentId) {
      const parent = this.getProjectById(currentProject.parentId);
      if (!parent) break;
      hierarchy.unshift(parent);
      currentProject = parent;
    }

    // 자식 프로젝트 찾기
    const findChildren = (parentId: string) => {
      const children = this.getChildProjects(parentId);
      children.forEach(child => {
        hierarchy.push(child);
        findChildren(child.id);
      });
    };

    if (project.type === ProjectType.MASTER) {
      findChildren(project.id);
    }

    return hierarchy;
  }

  // 프로젝트 생성
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    return this.db.create('projects', project) as Project;
  }

  // 프로젝트 업데이트
  updateProject(id: string | ProjectId, updates: Partial<Project>): boolean {
    return this.db.update('projects', id, updates);
  }

  // 프로젝트 삭제
  deleteProject(id: string | ProjectId): boolean {
    return this.db.delete('projects', id);
  }
}