import type { Project } from '../types/project';

export const hierarchicalProjects: Project[] = [
  // 대형 프로젝트 1
  {
    id: 'master-1',
    type: 'master',
    level: 0,
    isExpanded: true,
    client: '삼성전자',
    manager: '김철수',
    productType: '',
    serviceType: '기타',
    currentStage: [],
    status: '진행중',
    progress: 60,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    manufacturer: '',
    container: '',
    packaging: '',
    priority: '높음',
    children: [
      {
        id: 'sub-1',
        type: 'sub',
        level: 1,
        parentId: 'master-1',
        client: '큐셀시스템',
        manager: '박민수',
        productType: 'A제품',
        serviceType: 'OEM',
        currentStage: ['설계', '제조'],
        status: '진행중',
        progress: 45,
        startDate: '2024-03-01',
        endDate: '2024-04-15',
        manufacturer: '큐셀시스템',
        container: '(주)연우',
        packaging: '(주)네트모베이지',
        priority: '높음',
        depositPaid: true,
        children: [
          {
            id: 'task-1-1',
            type: 'task',
            level: 2,
            parentId: 'sub-1',
            client: '큐셀시스템',
            manager: '박민수',
            productType: 'A제품 - 원료 준비',
            serviceType: 'OEM',
            currentStage: ['완료'],
            status: '완료',
            progress: 100,
            startDate: '2024-03-01',
            endDate: '2024-03-05',
            manufacturer: '큐셀시스템',
            container: '',
            packaging: '',
            priority: '높음',
            depositPaid: true
          },
          {
            id: 'task-1-2',
            type: 'task',
            level: 2,
            parentId: 'sub-1',
            client: '큐셀시스템',
            manager: '박민수',
            productType: 'A제품 - 혼합 및 제조',
            serviceType: 'OEM',
            currentStage: ['진행중'],
            status: '진행중',
            progress: 75,
            startDate: '2024-03-06',
            endDate: '2024-03-20',
            manufacturer: '큐셀시스템',
            container: '',
            packaging: '',
            priority: '높음',
            depositPaid: true
          },
          {
            id: 'task-1-3',
            type: 'task',
            level: 2,
            parentId: 'sub-1',
            client: '큐셀시스템',
            manager: '박민수',
            productType: 'A제품 - 포장 및 출하',
            serviceType: 'OEM',
            currentStage: ['시작전'],
            status: '시작전',
            progress: 0,
            startDate: '2024-03-21',
            endDate: '2024-04-15',
            manufacturer: '',
            container: '(주)연우',
            packaging: '(주)네트모베이지',
            priority: '높음',
            depositPaid: true
          }
        ]
      },
      {
        id: 'sub-2',
        type: 'sub',
        level: 1,
        parentId: 'master-1',
        client: '큐셀시스템',
        manager: '정수진',
        productType: 'B제품',
        serviceType: 'ODM',
        currentStage: ['기획'],
        status: '시작전',
        progress: 10,
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        manufacturer: '주식회사 코스모로스',
        container: '삼화플라스틱',
        packaging: '서울포장산업(주)',
        priority: '보통',
        depositPaid: false,
        children: [
          {
            id: 'task-2-1',
            type: 'task',
            level: 2,
            parentId: 'sub-2',
            client: '큐셀시스템',
            manager: '정수진',
            productType: 'B제품 - 기획 및 디자인',
            serviceType: 'ODM',
            currentStage: ['진행중'],
            status: '진행중',
            progress: 30,
            startDate: '2024-04-01',
            endDate: '2024-04-10',
            manufacturer: '',
            container: '',
            packaging: '',
            priority: '보통',
            depositPaid: false
          },
          {
            id: 'task-2-2',
            type: 'task',
            level: 2,
            parentId: 'sub-2',
            client: '큐셀시스템',
            manager: '정수진',
            productType: 'B제품 - 제조 준비',
            serviceType: 'ODM',
            currentStage: ['시작전'],
            status: '시작전',
            progress: 0,
            startDate: '2024-04-11',
            endDate: '2024-04-30',
            manufacturer: '주식회사 코스모로스',
            container: '삼화플라스틱',
            packaging: '서울포장산업(주)',
            priority: '보통',
            depositPaid: false
          }
        ]
      },
      {
        id: 'sub-3',
        type: 'sub',
        level: 1,
        parentId: 'master-1',
        client: '(주)연우',
        manager: '김지현',
        productType: 'C제품',
        serviceType: 'OBM',
        currentStage: ['완료'],
        status: '완료',
        progress: 100,
        startDate: '2024-02-01',
        endDate: '2024-03-15',
        manufacturer: '(주)뷰티팩토리',
        container: '(주)에이치피씨',
        packaging: '(주)한솔피엔에스',
        priority: '높음',
        depositPaid: true
      }
    ]
  },
  
  // 대형 프로젝트 2
  {
    id: 'master-2',
    type: 'master',
    level: 0,
    isExpanded: false,
    client: 'LG전자',
    manager: '한지민',
    productType: '',
    serviceType: '기타',
    currentStage: [],
    status: '시작전',
    progress: 0,
    startDate: '2024-07-01',
    endDate: '2024-12-31',
    manufacturer: '',
    container: '',
    packaging: '',
    priority: '보통',
    children: [
      {
        id: 'sub-4',
        type: 'sub',
        level: 1,
        parentId: 'master-2',
        client: '네트모베이지',
        manager: '송민호',
        productType: 'D제품',
        serviceType: 'Private Label',
        currentStage: [],
        status: '시작전',
        progress: 0,
        startDate: '2024-07-15',
        endDate: '2024-09-30',
        manufacturer: '코스메카코리아',
        container: '태성산업(주)',
        packaging: '대림포장(주)',
        priority: '낮음'
      }
    ]
  },
  
  // 독립적인 소형 프로젝트들 (대형 프로젝트에 속하지 않음)
  {
    id: 'independent-1',
    type: 'sub',
    level: 0,
    client: '코스모로스',
    manager: '이준호',
    productType: 'E제품',
    serviceType: 'OEM',
    currentStage: ['제조', '포장'],
    status: '진행중',
    progress: 65,
    startDate: '2024-05-01',
    endDate: '2024-05-30',
    manufacturer: '(주)아모레퍼시픽 오산공장',
    container: '(주)펌텍코리아',
    packaging: '(주)새한패키지',
    priority: '높음',
    depositPaid: true
  },
  {
    id: 'independent-2',
    type: 'sub',
    level: 0,
    client: '삼성전자',
    manager: '박서준',
    productType: 'F제품',
    serviceType: 'ODM',
    currentStage: ['기획', '설계'],
    status: '진행중',
    progress: 30,
    startDate: '2024-06-01',
    endDate: '2024-07-15',
    manufacturer: '큐셀시스템',
    container: '(주)연우',
    packaging: '(주)네트모베이지',
    priority: '보통',
    depositPaid: false
  },
  {
    id: 'independent-3',
    type: 'sub',
    level: 0,
    client: 'LG전자',
    manager: '김태희',
    productType: 'G제품',
    serviceType: 'White Label',
    currentStage: ['완료'],
    status: '완료',
    progress: 100,
    startDate: '2024-03-01',
    endDate: '2024-04-30',
    manufacturer: '주식회사 코스모로스',
    container: '삼화플라스틱',
    packaging: '서울포장산업(주)',
    priority: '높음',
    depositPaid: true
  }
];

// 평면화된 프로젝트 리스트를 계층 구조로 변환하는 유틸리티 함수
export function flattenProjects(projects: Project[]): Project[] {
  const result: Project[] = [];
  
  projects.forEach(project => {
    result.push(project);
    
    // 대형 프로젝트가 확장되어 있으면 소형 프로젝트들 추가
    if (project.type === 'master' && project.isExpanded && project.children) {
      project.children.forEach(subProject => {
        result.push(subProject);
        
        // 소형 프로젝트가 확장되어 있으면 태스크들 추가
        if (subProject.isExpanded && subProject.children) {
          subProject.children.forEach(task => {
            result.push(task);
          });
        }
      });
    }
  });
  
  return result;
}

// 프로젝트 확장/축소 토글 함수
export function toggleProject(projects: Project[], projectId: string): Project[] {
  return projects.map(project => {
    // 대형 프로젝트 토글
    if (project.id === projectId) {
      return { ...project, isExpanded: !project.isExpanded };
    }
    
    // 대형 프로젝트의 자식(소형 프로젝트)들 확인
    if (project.type === 'master' && project.children) {
      const updatedChildren = project.children.map(subProject => {
        // 소형 프로젝트 토글
        if (subProject.id === projectId) {
          return { ...subProject, isExpanded: !subProject.isExpanded };
        }
        return subProject;
      });
      
      return { ...project, children: updatedChildren };
    }
    
    return project;
  });
}