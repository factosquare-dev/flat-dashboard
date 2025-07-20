import { useState, useEffect } from 'react';
import type { Project } from '../types/project';
import { factories } from '../data/factories';
import { scheduleApi } from '../api/scheduleApi';
import { extractProjectFromSchedule } from '../data/mockSchedules';
import type { Schedule } from '../types/schedule';
// 스케줄에서 프로젝트 데이터를 가져오기 위한 빈 초기 데이터
const initialProjects: Project[] = [];  // 빈 배열로 시작


export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [schedules, setSchedules] = useState<Map<string, Schedule>>(new Map());

  // 스케줄에서 프로젝트 데이터 가져오기
  useEffect(() => {
    const fetchSchedulesAndProjects = async () => {
      try {
        // 모든 스케줄 가져오기
        const allSchedules = await scheduleApi.getAllSchedules();
        console.log('모든 스케줄 데이터:', allSchedules);
        
        const newProjects: Project[] = [];
        const newSchedules = new Map<string, Schedule>();
        
        // 각 스케줄에서 프로젝트 정보 추출
        allSchedules.forEach(schedule => {
          const projectData = extractProjectFromSchedule(schedule);
          newProjects.push(projectData as Project);
          newSchedules.set(projectData.id, schedule);
        });
        
        console.log('스케줄에서 추출한 프로젝트:', newProjects);
        
        setProjects(newProjects);
        setSchedules(newSchedules);
      } catch (error) {
        console.error('스케줄 데이터 가져오기 실패:', error);
      }
    };
    
    fetchSchedulesAndProjects();
  }, []); // 마운트 시 한 번만 실행

  const updateProject = (projectId: string, field: keyof Project, value: any) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, [field]: value } : p
    ));
  };
  
  const updateProjectBatch = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
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
      startDate: getRelativeDate(Math.floor(Math.random() * 30) - 15),
      endDate: getRelativeDate(Math.floor(Math.random() * 90) + 30),
      manufacturer: getRandomFactory('제조').name,
      container: getRandomFactory('용기').name,
      packaging: getRandomFactory('포장').name,
      sales: `${Math.floor(Math.random() * 1000000000) + 100000000}`,
      purchase: `${Math.floor(Math.random() * 500000000) + 50000000}`,
      priority: ['높음', '보통', '낮음'][index % 3] as any
    }));
    
    setProjects(prev => [...prev, ...newProjects]);
    setPage(prev => prev + 1);
    setIsLoading(false);
    
    // Stop loading after 2 pages for demo
    if (page >= 2) {
      setHasMore(false);
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
    getProjectSchedule: (projectId: string) => schedules.get(projectId) || null
  };
};