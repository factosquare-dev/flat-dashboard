/**
 * Project-related mock data service methods
 */

import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import type { Project } from '@/shared/types/project';
import type { ProjectId } from '@/shared/types/branded';
import { ProjectType } from '@/shared/types/enums';
import { TaskChecklistItem, TaskChecklistLabel, TaskChecklistOrder } from '@/shared/types/enums/taskChecklist';

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

  // 프로젝트 상세 섹션 데이터 가져오기
  getProjectSectionData(projectId: string | ProjectId, section: string) {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    // 기본 mock 데이터 - 실제로는 프로젝트별 데이터를 반환해야 함
    switch (section) {
      case 'request':
        return project.developmentRequest || {
          requestDate: '2025.01.15',
          content: `${project.productType} 제품 개발`,
          manager: project.manager || '김개발',
          companyName: project.customer.name,
          contactPerson: project.customer.contactPerson,
          contactNumber: project.customer.contactNumber,
          emailAddress: project.customer.email
        };
      case 'content':
        return project.contentDetails || {
          mainIngredients: '히알루론산, 나이아신아마이드',
          volume: project.product?.volume || '150ml',
          requiredIngredients: ['히알루론산', '나이아신아마이드'],
          optionalIngredients: ['비타민C', '펩타이드'],
          excludedIngredients: ['파라벤', '인공색소']
        };
      case 'container':
        return project.containerDetails || {
          containerType: '펌프 보틀',
          material: 'PET',
          color: '투명',
          sealingLabel: '일반',
          unitBox: '개별 박스',
          design: '미니멀'
        };
      case 'design':
        return project.designLabeling || {
          productName: project.name,
          labelInfo: '사용방법, 주의사항, 제조번호 표기',
          isTemporaryName: false,
          targetProductLink: '',
          productConcept: '자연 친화적인 스킨케어'
        };
      case 'certification':
        return project.certification || {
          status: '진행중',
          expectedCompletion: '2025.03.01',
          exportCountry: project.exportCountry || '미정',
          clinicalTrial: '진행 예정',
          functionalCertifications: ['미백', '주름개선'],
          desiredShelfLife: '36개월',
          forInfants: 'N'
        };
      default:
        return null;
    }
  }

  // TaskChecklist 관련 메서드들
  getProjectTaskChecklist(projectId: string | ProjectId) {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    // 프로젝트에 TaskChecklist가 있으면 반환, 없으면 기본 템플릿 기반으로 생성
    if (project.taskChecklist) {
      return project.taskChecklist;
    }

    // 실제 TaskChecklist 템플릿 생성
    const defaultChecklist = {
      projectId: project.id,
      templateId: 'standard-template',
      status: {
        [TaskChecklistItem.REVIEW_REQUEST]: false,
        [TaskChecklistItem.MEETING_REQUEST]: false,
        [TaskChecklistItem.SAMPLE_REQUEST]: false,
        [TaskChecklistItem.SAMPLE_CONFIRM]: false,
        [TaskChecklistItem.CT_REQUEST]: false,
        [TaskChecklistItem.CT_CONFIRM]: false,
        [TaskChecklistItem.LABEL_TEXT]: false,
        [TaskChecklistItem.DESIGN]: false,
        [TaskChecklistItem.CONTAINER_ORDER]: false,
        [TaskChecklistItem.CONTAINER_RECEIVE]: false,
        [TaskChecklistItem.CONTENT_ORDER]: false,
        [TaskChecklistItem.MATERIAL_ORDER]: false,
        [TaskChecklistItem.PACKAGING_SPEC]: false,
        [TaskChecklistItem.PRODUCTION_SCHEDULE]: false,
        [TaskChecklistItem.CERTIFICATION]: false,
        [TaskChecklistItem.FINAL_CONFIRM]: false
      },
      updatedAt: new Date()
    };

    return defaultChecklist;
  }

  // 현재 진행 중인 TaskChecklist 아이템들 가져오기 (ProjectList currentStage 대신 사용)
  getCurrentTaskStages(projectId: string | ProjectId): string[] {
    const checklist = this.getProjectTaskChecklist(projectId);
    if (!checklist) return [];

    // TaskChecklistOrder에 따른 순서로 확인
    const orderedItems = TaskChecklistOrder;
    
    // 완료된 마지막 아이템 찾기
    let lastCompletedIndex = -1;
    for (let i = 0; i < orderedItems.length; i++) {
      if (checklist.status[orderedItems[i]]) {
        lastCompletedIndex = i;
      }
    }

    // 현재 진행 중인 단계들 결정 (다음 1-2개 단계)
    const currentStages: string[] = [];
    
    // 다음 진행 단계 1-2개 가져오기
    for (let i = lastCompletedIndex + 1; i < Math.min(lastCompletedIndex + 3, orderedItems.length); i++) {
      if (i >= 0 && i < orderedItems.length) {
        const item = orderedItems[i];
        if (!checklist.status[item]) {
          currentStages.push(this.getTaskChecklistItemLabel(item));
        }
      }
    }

    // 아무것도 시작하지 않은 경우 첫 번째 단계 표시
    if (currentStages.length === 0 && lastCompletedIndex === -1) {
      currentStages.push(this.getTaskChecklistItemLabel(orderedItems[0]));
    }

    return currentStages;
  }

  // TaskChecklistItem을 한글 라벨로 변환
  private getTaskChecklistItemLabel(item: TaskChecklistItem): string {
    return TaskChecklistLabel[item] || item;
  }
}