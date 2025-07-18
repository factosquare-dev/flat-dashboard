import { useState } from 'react';
import type { Project } from '../types/project';

// Helper function to get date relative to today
const getRelativeDate = (daysFromToday: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
};

// Initial projects data
const initialProjects: Project[] = [
  {
    id: '1',
    client: '(주)뷰티코리아',
    manager: '김철수',
    productType: '스킨케어',
    serviceType: 'OEM',
    currentStage: ['샘플 제작', '품질 검사'],
    status: '진행중',
    progress: 65,
    startDate: getRelativeDate(7),
    endDate: getRelativeDate(45),
    manufacturer: '큐셀시스템',
    container: '(주)연우',
    packaging: '(주)네트모베이지',
    sales: '1200000000',
    purchase: '800000000',
    priority: '보통'
  },
  {
    id: '2',
    client: '글로벌코스메틱',
    manager: '이영희',
    productType: '메이크업',
    serviceType: 'ODM',
    currentStage: ['디자인 검토'],
    status: '진행중',
    progress: 30,
    startDate: getRelativeDate(15),
    endDate: getRelativeDate(60),
    manufacturer: '(주)연우',
    container: '큐셀시스템',
    packaging: '주식회사 코스모로스',
    sales: '500000000',
    purchase: '300000000',
    priority: '낮음'
  },
  {
    id: '3',
    client: '네이처바이오',
    manager: '박민수',
    productType: '헤어케어',
    serviceType: 'OBM',
    currentStage: ['최종 승인 대기'],
    status: '진행중',
    progress: 90,
    startDate: getRelativeDate(3),
    endDate: getRelativeDate(25),
    manufacturer: '주식회사 코스모로스',
    container: '(주)네트모베이지',
    packaging: '(주)연우',
    sales: '800000000',
    purchase: '500000000',
    priority: '높음'
  },
  {
    id: '4',
    client: '프리미엄뷰티',
    manager: '정수진',
    productType: '바디케어',
    serviceType: 'Private Label',
    currentStage: [],
    status: '시작전',
    progress: 0,
    startDate: getRelativeDate(30),
    endDate: getRelativeDate(90),
    manufacturer: '(주)네트모베이지',
    container: '주식회사 코스모로스',
    packaging: '큐셀시스템',
    sales: '300000000',
    purchase: '200000000',
    priority: '낮음'
  },
  {
    id: '5',
    client: '클린뷰티랩',
    manager: '최지훈',
    productType: '선케어',
    serviceType: 'White Label',
    currentStage: [],
    status: '완료',
    progress: 100,
    startDate: getRelativeDate(2),
    endDate: getRelativeDate(15),
    manufacturer: '큐셀시스템',
    container: '(주)연우',
    packaging: '주식회사 코스모로스',
    sales: '1500000000',
    purchase: '1000000000',
    priority: '높음'
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const updateProject = (projectId: string, field: keyof Project, value: any) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, [field]: value } : p
    ));
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const addProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      client: projectData.client || '',
      manager: projectData.manager || '',
      productType: projectData.productType || '',
      serviceType: projectData.serviceType || 'OEM',
      currentStage: [],
      status: '시작전',
      progress: 0,
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      endDate: projectData.endDate || new Date().toISOString().split('T')[0],
      manufacturer: projectData.manufacturer || '',
      container: projectData.container || '',
      packaging: projectData.packaging || '',
      sales: projectData.sales || '0',
      purchase: projectData.purchase || '0',
      priority: projectData.priority || '보통'
    };
    setProjects([...projects, newProject]);
  };

  const getSelectedFactories = () => {
    const factories = new Set<string>();
    selectedRows.forEach(projectId => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        factories.add(project.manufacturer);
        factories.add(project.container);
        factories.add(project.packaging);
      }
    });
    return Array.from(factories);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(projects.map(p => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, projectId]);
    } else {
      setSelectedRows(selectedRows.filter(id => id !== projectId));
    }
  };

  const loadMoreProjects = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate more projects
    const newProjects = Array.from({ length: 10 }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      client: `클라이언트 ${page * 10 + index + 1}`,
      manager: `매니저 ${page * 10 + index + 1}`,
      productType: ['스킨케어', '메이크업', '헤어케어', '바디케어'][index % 4],
      serviceType: ['OEM', 'ODM', 'OBM', 'Private Label'][index % 4] as any,
      currentStage: ['샘플 제작', '품질 검사'],
      status: ['진행중', '시작전', '완료'][index % 3] as any,
      progress: Math.floor(Math.random() * 100),
      startDate: getRelativeDate(Math.floor(Math.random() * 30)),
      endDate: getRelativeDate(Math.floor(Math.random() * 90) + 30),
      manufacturer: ['큐셀시스템', '(주)연우', '주식회사 코스모로스'][index % 3],
      container: ['(주)연우', '큐셀시스템', '(주)네트모베이지'][index % 3],
      packaging: ['(주)네트모베이지', '주식회사 코스모로스', '큐셀시스템'][index % 3],
      sales: `${Math.floor(Math.random() * 1000000000) + 100000000}`,
      purchase: `${Math.floor(Math.random() * 500000000) + 50000000}`,
      priority: ['높음', '보통', '낮음'][index % 3] as any
    }));
    
    setProjects(prev => [...prev, ...newProjects]);
    setPage(prev => prev + 1);
    setIsLoading(false);
    
    // Stop loading after 5 pages for demo
    if (page >= 5) {
      setHasMore(false);
    }
  };

  return {
    projects,
    setProjects,
    selectedRows,
    setSelectedRows,
    isLoading,
    hasMore,
    updateProject,
    deleteProject,
    addProject,
    getSelectedFactories,
    handleSelectAll,
    handleSelectRow,
    loadMoreProjects
  };
};