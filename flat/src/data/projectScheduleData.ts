import type { Project } from '../types/project';
import type { Schedule, Task, Participant } from '../types/schedule';
import type { Factory } from '../types/factory';
import { projectFactoriesByProjectId, getRandomManager } from './mockData';
import { formatDateISO } from '../utils/dateUtils';
import { factories } from './factories';
import { TASK_TYPES, FACTORY_TYPES } from '../constants/factory';
import { mockDataService } from '../services/mockDataService';
import { ProjectStatus, getProjectStatusFromLabel } from '../types/enums';

// 태스크 타입별 기간 (일)
const TASK_DURATIONS: { [key: string]: number } = {
  // 제조 공장 태스크
  [TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT]: 3,
  [TASK_TYPES.MANUFACTURING.MATERIAL_INSPECTION]: 2,
  [TASK_TYPES.MANUFACTURING.MIXING]: 7,
  [TASK_TYPES.MANUFACTURING.BLENDING]: 5,
  [TASK_TYPES.MANUFACTURING.AGING]: 3,
  [TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK]: 2,
  [TASK_TYPES.MANUFACTURING.FILLING]: 3,
  [TASK_TYPES.MANUFACTURING.SECOND_QUALITY_CHECK]: 2,
  [TASK_TYPES.MANUFACTURING.STABILITY_TEST]: 5,
  [TASK_TYPES.MANUFACTURING.FINAL_INSPECTION]: 2,
  [TASK_TYPES.MANUFACTURING.SHIPPING_PREP]: 2,
  
  // 용기 공장 태스크
  [TASK_TYPES.CONTAINER.DESIGN]: 5,
  [TASK_TYPES.CONTAINER.MOLD_MAKING]: 10,
  [TASK_TYPES.CONTAINER.PROTOTYPE_MAKING]: 5,
  [TASK_TYPES.CONTAINER.INJECTION_MOLDING]: 7,
  [TASK_TYPES.CONTAINER.CONTAINER_INSPECTION]: 2,
  [TASK_TYPES.CONTAINER.PRINTING_LABELING]: 3,
  [TASK_TYPES.CONTAINER.SURFACE_TREATMENT]: 3,
  [TASK_TYPES.CONTAINER.ASSEMBLY]: 3,
  [TASK_TYPES.CONTAINER.PACKAGING_PREP]: 2,
  [TASK_TYPES.CONTAINER.QUALITY_CHECK]: 2,
  [TASK_TYPES.CONTAINER.SHIPPING]: 1,
  
  // 포장 공장 태스크
  [TASK_TYPES.PACKAGING.DESIGN]: 5,
  [TASK_TYPES.PACKAGING.PRINT_PREP]: 3,
  [TASK_TYPES.PACKAGING.MATERIAL_MAKING]: 4,
  [TASK_TYPES.PACKAGING.PACKAGING_WORK]: 4,
  [TASK_TYPES.PACKAGING.LABEL_ATTACHMENT]: 2,
  [TASK_TYPES.PACKAGING.BOX_PACKAGING]: 3,
  [TASK_TYPES.PACKAGING.SHRINK_WRAP]: 2,
  [TASK_TYPES.PACKAGING.PACKAGING_INSPECTION]: 2,
  [TASK_TYPES.PACKAGING.PALLET_LOADING]: 2,
  [TASK_TYPES.PACKAGING.SHIPPING_PREP]: 2,
  [TASK_TYPES.PACKAGING.DELIVERY]: 1
};

// 공장 타입별 태스크 목록
const FACTORY_TYPE_TASKS: { [key: string]: string[] } = {
  [FACTORY_TYPES.MANUFACTURING]: [
    TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT,
    TASK_TYPES.MANUFACTURING.MIXING,
    TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK,
    TASK_TYPES.MANUFACTURING.STABILITY_TEST,
    TASK_TYPES.MANUFACTURING.FINAL_INSPECTION
  ],
  [FACTORY_TYPES.CONTAINER]: [
    TASK_TYPES.CONTAINER.MOLD_MAKING,
    TASK_TYPES.CONTAINER.INJECTION_MOLDING,
    TASK_TYPES.CONTAINER.SURFACE_TREATMENT,
    TASK_TYPES.CONTAINER.QUALITY_CHECK,
    TASK_TYPES.CONTAINER.PACKAGING_PREP
  ],
  [FACTORY_TYPES.PACKAGING]: [
    TASK_TYPES.PACKAGING.DESIGN,
    TASK_TYPES.PACKAGING.PRINT_PREP,
    TASK_TYPES.PACKAGING.PACKAGING_WORK,
    TASK_TYPES.PACKAGING.LABEL_ATTACHMENT,
    TASK_TYPES.PACKAGING.PACKAGING_INSPECTION
  ],
  'default': [
    TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT,
    TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK,
    TASK_TYPES.MANUFACTURING.FINAL_INSPECTION,
    TASK_TYPES.MANUFACTURING.SHIPPING_PREP
  ]
};

// Factory ID로 태스크 목록 가져오기
const getFactoryTasksById = (factoryId: string, factoryType: string): string[] => {
  // Factory ID로 특정 태스크가 있는지 확인
  if (FACTORY_TASKS_BY_ID[factoryId]) {
    return FACTORY_TASKS_BY_ID[factoryId];
  }
  
  // factories.ts에서 해당 공장의 서비스 또는 태스크 정보 가져오기
  const factory = factories.find(f => f.id === factoryId);
  if (factory && factory.services && factory.services.length > 0) {
    // 서비스 이름을 TASK_TYPES에 매핑하는 로직이 필요할 수 있음
    return factory.services;
  }
  
  // Fallback: 타입별 기본 태스크
  return FACTORY_TYPE_TASKS[factoryType] || FACTORY_TYPE_TASKS['default'];
};


// 공장별 태스크 목록 (특정 공장에 특화된 태스크) - Factory ID 기반
const FACTORY_TASKS_BY_ID: { [key: string]: string[] } = {
  'mfg-1': [ // 큐셀시스템
    TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT,
    TASK_TYPES.MANUFACTURING.MIXING,
    TASK_TYPES.MANUFACTURING.FINAL_INSPECTION,
    TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK,
    TASK_TYPES.MANUFACTURING.SHIPPING_PREP
  ],
  'cont-1': [ // (주)연우
    TASK_TYPES.CONTAINER.MOLD_MAKING,
    TASK_TYPES.CONTAINER.INJECTION_MOLDING,
    TASK_TYPES.CONTAINER.SURFACE_TREATMENT,
    TASK_TYPES.CONTAINER.ASSEMBLY,
    TASK_TYPES.CONTAINER.QUALITY_CHECK
  ],
  'pack-1': [ // (주)네트모베이지
    TASK_TYPES.PACKAGING.DESIGN,
    TASK_TYPES.PACKAGING.PRINT_PREP,
    TASK_TYPES.PACKAGING.PACKAGING_WORK,
    TASK_TYPES.PACKAGING.PACKAGING_INSPECTION,
    TASK_TYPES.PACKAGING.SHIPPING_PREP
  ],
  'mfg-2': [ // 주식회사 코스모로스
    TASK_TYPES.MANUFACTURING.MATERIAL_INSPECTION,
    TASK_TYPES.MANUFACTURING.BLENDING,
    TASK_TYPES.MANUFACTURING.STABILITY_TEST,
    TASK_TYPES.MANUFACTURING.SHIPPING_PREP
  ]
};

// 날짜 계산 함수
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date): string => {
  return formatDateISO(date);
};

// 공장 ID로 담당자 가져오기
const getAssigneeForFactoryId = (factoryId: string): string => {
  // Mock DB에서 담당자 정보 가져오기
  return mockDataService.getAssigneeForFactoryId(factoryId);
};


// 프로젝트 진행률에 따른 태스크 생성
export const generateTasksForProject = (project: Project, projectFactories: ProjectFactory[]): Task[] => {
  const tasks: Task[] = [];
  let taskId = 1;
  const projectStartDate = new Date(project.startDate);
  const projectEndDate = new Date(project.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 프로젝트 상태에 따른 태스크 생성 로직
  const isProjectStarted = today >= projectStartDate;
  const isProjectEnded = today > projectEndDate;
  
  // 프로젝트에 할당된 공장 ID들 가져오기
  const manufacturerFactory = project.manufacturerId ? mockDataService.getFactoryById(project.manufacturerId) : undefined;
  const containerFactory = project.containerId ? mockDataService.getFactoryById(project.containerId) : undefined;
  const packagingFactory = project.packagingId ? mockDataService.getFactoryById(project.packagingId) : undefined;
  
  const assignedFactories = [
    manufacturerFactory,
    containerFactory,
    packagingFactory
  ].filter(f => f !== undefined) as Factory[];
  
  assignedFactories.forEach((factory, factoryIndex) => {
    // 공장 타입은 factory 객체에서 직접 가져오기
    const factoryType = factory.type;
    
    // factories.ts에서 공장별 태스크 가져오기
    const factoryTasks = getFactoryTasksById(factory.id, factoryType);
    
    let taskStartDate = new Date(projectStartDate);
    
    // 공장별로 약간의 시작 날짜 오프셋 추가 (병렬 작업 표현)
    taskStartDate = addDays(taskStartDate, factoryIndex * 2);
    
    factoryTasks.forEach((taskType, taskIndex) => {
      const duration = TASK_DURATIONS[taskType as keyof typeof TASK_DURATIONS] || 5;
      let taskEndDate = addDays(taskStartDate, duration);
      
      // 태스크 상태 결정 (오늘 날짜 기준)
      let status: 'pending' | 'in-progress' | 'completed' = 'pending';
      
      // 뷰티코리아 프로젝트에 지연된 태스크 추가
      if (project.client?.includes('뷰티코리아') && taskIndex === 0) {
        // 첫 번째 태스크를 지연 상태로 만들기
        taskStartDate = addDays(today, -10);
        taskEndDate = addDays(today, -3);
        status = 'in-progress'; // 종료일이 지났는데 완료되지 않음
      } else {
        const projectStatus = getProjectStatusFromLabel(project.status);
        if (projectStatus === ProjectStatus.COMPLETED) {
          status = 'completed';
        } else if (projectStatus === ProjectStatus.PLANNING) {
          status = 'pending';
        } else if (projectStatus === ProjectStatus.IN_PROGRESS) {
        // 진행중인 프로젝트의 경우 날짜로 판단
        if (taskEndDate < today) {
          status = 'completed';
        } else if (taskStartDate <= today && taskEndDate >= today) {
          // 오늘 날짜가 태스크 기간에 포함되면 진행중
          status = 'in-progress';
        } else {
          status = 'pending';
        }
      }
      
      tasks.push({
        id: taskId++,
        factory: factory.name,
        taskType: taskType,
        title: taskType,
        startDate: formatDate(taskStartDate),
        endDate: formatDate(taskEndDate),
        color: factory.color.replace('bg-', '').replace('-500', ''),
        status: status,
        projectId: project.id,
        assignee: getAssigneeForFactoryId(factory.id),
        x: 0,
        width: 0
      });
      
      // 다음 태스크는 현재 태스크가 끝난 후 시작 (순차적 작업)
      taskStartDate = addDays(taskEndDate, 1);
    });
  });
  
  return tasks;
};

// 프로젝트에서 스케줄 생성
export const createScheduleFromProject = (project: Project): Schedule => {
  // Get factory objects from the project names
  const allFactories = mockDataService.getAllFactories();
  const manufacturerFactory = allFactories.find(f => f.name === project.manufacturer);
  const containerFactory = allFactories.find(f => f.name === project.container);
  const packagingFactory = allFactories.find(f => f.name === project.packaging);
  
  const projectFactories = [
    manufacturerFactory && { ...manufacturerFactory, color: 'bg-blue-500' },
    containerFactory && { ...containerFactory, color: 'bg-red-500' },
    packagingFactory && { ...packagingFactory, color: 'bg-yellow-500' }
  ].filter(Boolean) as (Factory & { color: string })[];
  
  const participants: Participant[] = projectFactories.map(factory => ({
    id: factory.id,
    name: factory.name,
    period: `${project.startDate} ~ ${project.endDate}`,
    color: factory.color.replace('bg-', '').replace('-500', '')
  }));
  
  const tasks = generateTasksForProject(project, projectFactories);
  
  
  // 고유한 스케줄 ID 생성
  const scheduleId = `schedule-${project.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Use client property if available (from hierarchicalProjects), otherwise use a default
  const projectName = project.client ? `${project.client} - ${project.productType}` : project.productType;
  
  return {
    id: scheduleId,
    projectId: project.id,
    name: projectName,
    startDate: project.startDate,
    endDate: project.endDate,
    participants,
    tasks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// 여러 프로젝트에서 스케줄 목록 생성
export const createSchedulesFromProjects = (projects: Project[]): Schedule[] => {
  return projects.map(project => createScheduleFromProject(project));
};

// 진행 중인 태스크 샘플 생성
export const createSampleInProgressTasks = (): Task[] => {
  const today = new Date();
  const allFactories = mockDataService.getAllFactories();
  
  // 공장 ID로 가져오기
  const mfgFactory1 = allFactories.find(f => f.id === 'mfg-1');
  const contFactory1 = allFactories.find(f => f.id === 'cont-1');
  const packFactory1 = allFactories.find(f => f.id === 'pack-1');
  const mfgFactory2 = allFactories.find(f => f.id === 'mfg-2');
  
  const tasks: Task[] = [];
  
  if (mfgFactory1) {
    tasks.push({
      id: 101,
      factory: mfgFactory1.name,
      factoryId: mfgFactory1.id,
      taskType: TASK_TYPES.MANUFACTURING.MIXING,
      startDate: formatDate(addDays(today, -2)),
      endDate: formatDate(addDays(today, 3)),
      color: 'blue',
      status: 'in-progress',
      projectId: '1'
    });
    
    tasks.push({
      id: 105,
      factory: mfgFactory1.name,
      factoryId: mfgFactory1.id,
      taskType: TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK,
      startDate: formatDate(addDays(today, -1)),
      endDate: formatDate(addDays(today, 1)),
      color: 'blue',
      status: 'in-progress',
      projectId: '3'
    });
  }
  
  if (contFactory1) {
    tasks.push({
      id: 102,
      factory: contFactory1.name,
      factoryId: contFactory1.id,
      taskType: TASK_TYPES.CONTAINER.INJECTION_MOLDING,
      startDate: formatDate(addDays(today, -1)),
      endDate: formatDate(addDays(today, 6)),
      color: 'red',
      status: 'in-progress',
      projectId: '1'
    });
  }
  
  if (packFactory1) {
    tasks.push({
      id: 103,
      factory: packFactory1.name,
      factoryId: packFactory1.id,
      taskType: TASK_TYPES.PACKAGING.PACKAGING_WORK,
      startDate: formatDate(addDays(today, -5)),
      endDate: formatDate(addDays(today, 9)),
      color: 'yellow',
      status: 'in-progress',
      projectId: '2'
    });
  }
  
  if (mfgFactory2) {
    tasks.push({
      id: 104,
      factory: mfgFactory2.name,
      factoryId: mfgFactory2.id,
      taskType: TASK_TYPES.MANUFACTURING.STABILITY_TEST,
      startDate: formatDate(today),
      endDate: formatDate(addDays(today, 5)),
      color: 'cyan',
      status: 'in-progress',
      projectId: '3'
    });
  }
  
  return tasks;
};

interface ProjectFactory extends Factory {
  color: string;
}