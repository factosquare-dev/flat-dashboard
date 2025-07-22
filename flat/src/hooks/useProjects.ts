import { useState, useEffect, useCallback, useRef } from 'react';
import type { Project } from '../types/project';
import { factories } from '../data/factories';
import { scheduleApi } from '../api/scheduleApi';
import { extractProjectFromSchedule } from '../data/mockSchedules';
import type { Schedule } from '../types/schedule';
import { useInfiniteScroll } from './useInfiniteScroll';
import { hierarchicalProjects, flattenProjects, toggleProject } from '../data/hierarchicalProjects';
// 스케줄에서 프로젝트 데이터를 가져오기 위한 빈 초기 데이터
const initialProjects: Project[] = [];  // 빈 배열로 시작

// 헬퍼 함수들
const getRelativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const getRandomFactory = (type: string) => {
  const filteredFactories = factories.filter(f => f.type === type);
  return filteredFactories[Math.floor(Math.random() * filteredFactories.length)];
};


export const useProjects = () => {
  // 임시로 계층 구조 데이터 사용
  const [hierarchicalData, setHierarchicalData] = useState<Project[]>(hierarchicalProjects);
  const [projects, setProjects] = useState<Project[]>(flattenProjects(hierarchicalProjects));
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [schedules, setSchedules] = useState<Map<string, Schedule>>(new Map());
  
  // 윈도우 방식 무한 스크롤을 위한 상태
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 50; // 한 번에 로드할 아이템 수
  const PREFETCH_THRESHOLD = 0.7; // 70% 스크롤 시 미리 로드
  
  // Race condition 방지를 위한 ref
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 스케줄에서 프로젝트 데이터 가져오기
  useEffect(() => {
    const fetchSchedulesAndProjects = async () => {
      try {
        // 모든 스케줄 가져오기
        const allSchedules = await scheduleApi.getAllSchedules();
        
        const newProjects: Project[] = [];
        const newSchedules = new Map<string, Schedule>();
        
        // 각 스케줄에서 프로젝트 정보 추출
        allSchedules.forEach(schedule => {
          const projectData = extractProjectFromSchedule(schedule);
          newProjects.push(projectData as Project);
          newSchedules.set(projectData.id, schedule);
        });
        
        
        setProjects(newProjects);
        setSchedules(newSchedules);
      } catch (error) {
      }
    };
    
    fetchSchedulesAndProjects();
  }, []); // 마운트 시 한 번만 실행

  const updateProject = useCallback((projectId: string, field: keyof Project, value: any) => {
    setProjects(prevProjects => prevProjects.map(p => 
      p.id === projectId ? { ...p, [field]: value } : p
    ));
  }, []);
  
  const updateProjectBatch = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prevProjects => prevProjects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    ));
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
  }, []);

  const addProject = useCallback((projectData: Partial<Project>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      client: projectData.client || '',
      manager: projectData.manager || '',
      productType: projectData.productType || '',
      serviceType: projectData.serviceType || 'OEM',
      currentStage: projectData.currentStage || [],
      status: projectData.status || '시작전',
      progress: projectData.progress || 0,
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      endDate: projectData.endDate || new Date().toISOString().split('T')[0],
      manufacturer: projectData.manufacturer || '',
      container: projectData.container || '',
      packaging: projectData.packaging || '',
      sales: projectData.sales || '0',
      purchase: projectData.purchase || '0',
      priority: projectData.priority || '보통',
      depositPaid: projectData.depositPaid || false
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
  }, []);

  const getSelectedFactories = () => {
    // 프로젝트가 선택되지 않았으면 모든 공장을 반환
    if (selectedRows.length === 0) {
      return factories.map(f => ({
        name: f.name,
        color: f.type === '제조' ? 'bg-blue-500' : 
               f.type === '용기' ? 'bg-red-500' : 'bg-yellow-500',
        type: f.type
      }));
    }
    
    // 프로젝트가 선택되었으면 해당 프로젝트의 공장만 반환
    const factoryMap = new Map<string, { name: string; color: string; type: string }>();
    
    selectedRows.forEach(projectId => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        // 제조 공장
        const manufactory = factories.find(f => f.name === project.manufacturer);
        if (manufactory && !factoryMap.has(manufactory.name)) {
          factoryMap.set(manufactory.name, { 
            name: manufactory.name, 
            color: 'bg-blue-500',
            type: manufactory.type 
          });
        }
        
        // 용기 공장
        const containerFactory = factories.find(f => f.name === project.container);
        if (containerFactory && !factoryMap.has(containerFactory.name)) {
          factoryMap.set(containerFactory.name, { 
            name: containerFactory.name, 
            color: 'bg-red-500',
            type: containerFactory.type 
          });
        }
        
        // 포장 공장
        const packagingFactory = factories.find(f => f.name === project.packaging);
        if (packagingFactory && !factoryMap.has(packagingFactory.name)) {
          factoryMap.set(packagingFactory.name, { 
            name: packagingFactory.name, 
            color: 'bg-yellow-500',
            type: packagingFactory.type 
          });
        }
      }
    });
    
    return Array.from(factoryMap.values());
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

  const loadMoreProjects = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 300);
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Aborted'));
        });
      });
      
      // 실제로는 API에서 total count를 받아옴
      const simulatedTotalCount = 500; // 예시: 전체 500개 항목
      setTotalCount(simulatedTotalCount);
      
      // 현재 페이지의 프로젝트 생성
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, simulatedTotalCount);
      
      const newProjects = Array.from({ length: endIndex - startIndex }, (_, index) => ({
        id: `${startIndex + index + 1}`,
        client: `클라이언트 ${startIndex + index + 1}`,
        manager: `매니저 ${startIndex + index + 1}`,
        productType: ['스킨케어', '메이크업', '헤어케어', '바디케어'][index % 4],
        serviceType: ['OEM', 'ODM', 'OBM', 'Private Label'][index % 4] as any,
        currentStage: ['샘플 제작', '품질 검사'],
        status: ['진행중', '시작전', '완료'][index % 3] as any,
        progress: Math.floor(Math.random() * 100),
        startDate: getRelativeDate(Math.floor(Math.random() * 30) - 15),
        endDate: getRelativeDate(Math.floor(Math.random() * 90) + 30),
        manufacturer: getRandomFactory('제조').name,
        container: getRandomFactory('용기').name,
        packaging: getRandomFactory('포장').name,
        sales: `${Math.floor(Math.random() * 1000000000) + 100000000}`,
        purchase: `${Math.floor(Math.random() * 500000000) + 50000000}`,
        priority: ['높음', '보통', '낮음'][index % 3] as any,
        depositPaid: Math.random() > 0.5
      }));
      
      setProjects(prev => [...prev, ...newProjects]);
      setPage(prev => prev + 1);
      
      // 더 이상 로드할 데이터가 없는지 확인
      if (projects.length + newProjects.length >= simulatedTotalCount) {
        setHasMore(false);
      }
    } catch (error: any) {
      if (error.message !== 'Aborted') {
        console.error('Failed to load more projects:', error);
      }
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, page, projects.length]);

  // 스크롤 위치 기반 프리페칭
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.project-table-container');
      if (!scrollContainer) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // 70% 스크롤 시 다음 페이지 미리 로드
      if (scrollPercentage > PREFETCH_THRESHOLD && hasMore && !isLoading) {
        loadMoreProjects();
      }
    };
    
    const scrollContainer = document.querySelector('.project-table-container');
    scrollContainer?.addEventListener('scroll', handleScroll);
    
    return () => {
      const scrollContainer = document.querySelector('.project-table-container');
      scrollContainer?.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoading, loadMoreProjects]);

  // 무한 스크롤 설정 (폴백용)
  const { observerRef: loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMoreProjects,
    threshold: 500 // 더 일찍 트리거
  });

  const refreshProjects = async () => {
    setIsLoading(true);
    setProjects([]);
    setPage(1);
    setHasMore(true);
    
    try {
      const allSchedules = await scheduleApi.getAllSchedules();
      const newProjects: Project[] = [];
      const newSchedules = new Map<string, Schedule>();
      
      allSchedules.forEach(schedule => {
        const projectData = extractProjectFromSchedule(schedule);
        newProjects.push(projectData as Project);
        newSchedules.set(projectData.id, schedule);
      });
      
      setProjects(newProjects);
      setSchedules(newSchedules);
    } catch (error) {
      console.error('Failed to refresh projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    setProjects,
    schedules,
    selectedRows,
    setSelectedRows,
    isLoading,
    hasMore,
    updateProject,
    updateProjectBatch,
    deleteProject,
    addProject,
    getSelectedFactories,
    handleSelectAll,
    handleSelectRow,
    loadMoreProjects,
    loadMoreRef,
    refreshProjects,
    getProjectSchedule: (projectId: string) => schedules.get(projectId) || null
  };
};