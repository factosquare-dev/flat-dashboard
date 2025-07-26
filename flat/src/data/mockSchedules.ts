import type { Schedule } from '../types/schedule';
import type { MockTask } from '../types/mockSchedule';
import { formatDateISO } from '../utils/coreUtils';
import { getRandomManager, getRandomProductType, allClients, managerNames } from './mockData';
import { mockFactories } from './scheduleMockData';
import { validateSchedule, TASK_CONSTRAINTS } from '../utils/taskValidation';
import { FACTORY_TYPES, TASK_TYPES } from '../constants/factory';
import { mockDataService } from '../services/mockDataService';
import { ProjectStatusLabel, ProjectStatus, PriorityLabel, Priority, ServiceType, ServiceTypeLabel, TaskStatus } from '../types/enums';

// 날짜 계산 함수
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date): string => {
  return formatDateISO(date);
};

// 테스트용 스케줄 데이터 생성 - mock DB 데이터 사용
export const createMockSchedules = (): Schedule[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Mock DB에서 데이터 가져오기
  const availableClients = allClients.length > 0 ? allClients : ['뷰티코리아', '그린코스메틱', '코스메디칼', '퍼스트뷰티'];
  const availableManagers = managerNames.length > 0 ? managerNames : ['김철수', '이영희', '박민수', '정수진'];
  const availableFactories = mockFactories.length > 0 ? mockFactories : [];
  
  // 타입별 공장 그룹 생성
  const manufacturingFactories = availableFactories.filter(f => f.type === FACTORY_TYPES.MANUFACTURING);
  const containerFactories = availableFactories.filter(f => f.type === FACTORY_TYPES.CONTAINER);
  const packagingFactories = availableFactories.filter(f => f.type === FACTORY_TYPES.PACKAGING);
  
  const schedules: Schedule[] = [
    // Sub-project schedules
    {
      id: 'sch-sub-1-1',
      projectId: 'sub-1-1',
      name: `뷰티코리아 - 프리미엄 에센스`,
      startDate: formatDate(addDays(today, -30)),
      endDate: formatDate(addDays(today, 60)),
      participants: [
        manufacturingFactories[0] && { id: manufacturingFactories[0].id, name: manufacturingFactories[0].name, period: `${formatDate(addDays(today, -30))} ~ ${formatDate(addDays(today, 60))}`, color: 'blue' }
      ].filter(Boolean),
      tasks: [
        // 제조 공장 태스크들
        ...(manufacturingFactories[0] ? [{
          id: 101, 
          factory: manufacturingFactories[0].name, 
          factoryId: manufacturingFactories[0].id, 
          taskType: TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT, 
          startDate: formatDate(addDays(today, -30)), 
          endDate: formatDate(addDays(today, -27)), 
          color: 'blue', 
          status: TaskStatus.COMPLETED, 
          projectId: 'sub-1-1'
        },
        {
          id: 102, 
          factory: manufacturingFactories[0].name, 
          factoryId: manufacturingFactories[0].id, 
          taskType: TASK_TYPES.MANUFACTURING.MIXING, 
          startDate: formatDate(addDays(today, -26)), 
          endDate: formatDate(addDays(today, -20)), 
          color: 'blue', 
          status: TaskStatus.COMPLETED, 
          projectId: 'sub-1-1'
        },
        {
          id: 103, 
          factory: manufacturingFactories[0].name, 
          factoryId: manufacturingFactories[0].id, 
          taskType: TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK, 
          startDate: formatDate(addDays(today, -19)), 
          endDate: formatDate(addDays(today, -15)), 
          color: 'blue', 
          status: TaskStatus.IN_PROGRESS, 
          projectId: 'sub-1-1'
        }] : [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sch-sub-1-2',
      projectId: 'sub-1-2',
      name: `뷰티코리아 - 화이트닝 크림`,
      startDate: formatDate(addDays(today, -20)),
      endDate: formatDate(addDays(today, 40)),
      participants: [
        manufacturingFactories[1] && { id: manufacturingFactories[1].id, name: manufacturingFactories[1].name, period: `${formatDate(addDays(today, -20))} ~ ${formatDate(addDays(today, 40))}`, color: 'purple' }
      ].filter(Boolean),
      tasks: [
        ...(manufacturingFactories[1] ? [{
          id: 107, 
          factory: manufacturingFactories[1].name, 
          factoryId: manufacturingFactories[1].id, 
          taskType: TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT, 
          startDate: formatDate(addDays(today, -20)), 
          endDate: formatDate(addDays(today, -17)), 
          color: 'purple', 
          status: TaskStatus.COMPLETED, 
          projectId: 'sub-1-2'
        },
        {
          id: 108, 
          factory: manufacturingFactories[1].name, 
          factoryId: manufacturingFactories[1].id, 
          taskType: TASK_TYPES.MANUFACTURING.MIXING, 
          startDate: formatDate(addDays(today, -16)), 
          endDate: formatDate(addDays(today, -10)), 
          color: 'purple', 
          status: TaskStatus.COMPLETED, 
          projectId: 'sub-1-2'
        },
        {
          id: 109, 
          factory: manufacturingFactories[1].name, 
          factoryId: manufacturingFactories[1].id, 
          taskType: TASK_TYPES.MANUFACTURING.FILLING, 
          startDate: formatDate(addDays(today, -9)), 
          endDate: formatDate(addDays(today, -5)), 
          color: 'purple', 
          status: TaskStatus.IN_PROGRESS, 
          projectId: 'sub-1-2'
        }] : [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Existing schedules
    {
      id: 'sch-001',
      projectId: 'proj-001',
      name: availableClients[0] ? `${availableClients[0]} - ${getRandomProductType()}` : `Client-${getRandomProductType()}`,
      startDate: formatDate(addDays(today, -30)),
      endDate: formatDate(addDays(today, 60)),
      participants: [
        manufacturingFactories[0] && { id: manufacturingFactories[0].id, name: manufacturingFactories[0].name, period: `${formatDate(addDays(today, -30))} ~ ${formatDate(addDays(today, 60))}`, color: 'blue' },
        containerFactories[0] && { id: containerFactories[0].id, name: containerFactories[0].name, period: `${formatDate(addDays(today, -30))} ~ ${formatDate(addDays(today, 60))}`, color: 'red' },
        packagingFactories[0] && { id: packagingFactories[0].id, name: packagingFactories[0].name, period: `${formatDate(addDays(today, -30))} ~ ${formatDate(addDays(today, 60))}`, color: 'yellow' }
      ].filter(Boolean),
      tasks: [
        // 제조 공장 태스크들 - 순차적으로 진행, 겹치지 않음
        ...(manufacturingFactories[0] ? [{
          id: 1, 
          factory: manufacturingFactories[0].name, 
          factoryId: manufacturingFactories[0].id, 
          taskType: TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT, 
          startDate: formatDate(addDays(today, -30)), 
          endDate: formatDate(addDays(today, -27)), 
          color: 'blue', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-001'
        },
        {
          id: 2, 
          factory: manufacturingFactories[0].name, 
          factoryId: manufacturingFactories[0].id, 
          taskType: TASK_TYPES.MANUFACTURING.MIXING, 
          startDate: formatDate(addDays(today, -26)), 
          endDate: formatDate(addDays(today, -20)), 
          color: 'blue', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-001'
        },
        {
          id: 4, 
          factory: manufacturingFactories[0].name, 
          factoryId: manufacturingFactories[0].id, 
          taskType: TASK_TYPES.MANUFACTURING.STABILITY_TEST, 
          startDate: formatDate(addDays(today, -19)), 
          endDate: formatDate(addDays(today, -15)), 
          color: 'blue', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-001', 
          assignee: mockDataService.getAssigneeForFactoryId(manufacturingFactories[0].id)
        }] : []),
        
        // 용기 공장 태스크들 - 순차적으로 진행, 겹치지 않음
        ...(containerFactories[0] ? [{
          id: 3, 
          factory: containerFactories[0].name, 
          factoryId: containerFactories[0].id, 
          taskType: TASK_TYPES.CONTAINER.MOLD_MAKING, 
          startDate: formatDate(addDays(today, -14)), 
          endDate: formatDate(addDays(today, -10)), 
          color: 'red', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-001'
        },
        {
          id: 6, 
          factory: containerFactories[0].name, 
          factoryId: containerFactories[0].id, 
          taskType: TASK_TYPES.CONTAINER.INJECTION_MOLDING, 
          startDate: formatDate(addDays(today, -9)), 
          endDate: formatDate(addDays(today, -5)), 
          color: 'red', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-001'
        }] : []),
        
        // 포장 공장 태스크들 - 순차적으로 진행, 겹치지 않음
        { id: 7, factory: packagingFactories[0]?.name || '(주)네트모베이지', factoryId: packagingFactories[0]?.id || 'pack-1', taskType: TASK_TYPES.PACKAGING.DESIGN, startDate: formatDate(addDays(today, 5)), endDate: formatDate(addDays(today, 9)), color: 'yellow', status: TaskStatus.PENDING, projectId: 'proj-001' },
        { id: 8, factory: packagingFactories[0]?.name || '(주)네트모베이지', factoryId: packagingFactories[0]?.id || 'pack-1', taskType: TASK_TYPES.PACKAGING.PACKAGING_WORK, startDate: formatDate(addDays(today, 10)), endDate: formatDate(addDays(today, 14)), color: 'yellow', status: TaskStatus.PENDING, projectId: 'proj-001' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sch-002',
      projectId: 'proj-002',
      name: `${availableClients[1] || '그린코스메틱'} - ${getRandomProductType()}`,
      startDate: formatDate(addDays(today, -20)),
      endDate: formatDate(addDays(today, 40)),
      participants: [
        manufacturingFactories[1] && { id: manufacturingFactories[1].id, name: manufacturingFactories[1].name, period: `${formatDate(addDays(today, -20))} ~ ${formatDate(addDays(today, 40))}`, color: 'purple' },
        containerFactories[1] && { id: containerFactories[1].id, name: containerFactories[1].name, period: `${formatDate(addDays(today, -20))} ~ ${formatDate(addDays(today, 40))}`, color: 'green' },
        packagingFactories[1] && { id: packagingFactories[1].id, name: packagingFactories[1].name, period: `${formatDate(addDays(today, -20))} ~ ${formatDate(addDays(today, 40))}`, color: 'orange' }
      ].filter(Boolean),
      tasks: [
        // 제조 공장 태스크들 - 순차적으로 진행, 겹치지 않음 (두 번째 제조 공장 사용)
        { id: 9, factory: manufacturingFactories[1]?.name || '주식회사 코스모로스', factoryId: manufacturingFactories[1]?.id || 'mfg-2', taskType: TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT, startDate: formatDate(addDays(today, -20)), endDate: formatDate(addDays(today, -17)), color: 'purple', status: TaskStatus.COMPLETED, projectId: 'proj-002' },
        { id: 10, factory: manufacturingFactories[1]?.name || '주식회사 코스모로스', factoryId: manufacturingFactories[1]?.id || 'mfg-2', taskType: TASK_TYPES.MANUFACTURING.MIXING, startDate: formatDate(addDays(today, -16)), endDate: formatDate(addDays(today, -10)), color: 'purple', status: TaskStatus.COMPLETED, projectId: 'proj-002' },
        { id: 13, factory: manufacturingFactories[1]?.name || '주식회사 코스모로스', factoryId: manufacturingFactories[1]?.id || 'mfg-2', taskType: TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK, startDate: formatDate(addDays(today, -9)), endDate: formatDate(addDays(today, -5)), color: 'purple', status: TaskStatus.COMPLETED, projectId: 'proj-002' },
        
        // 용기 공장 태스크들 - 순차적으로 진행, 겹치지 않음 (두 번째 용기 공장 사용)
        { id: 11, factory: containerFactories[1]?.name || '삼화플라스틱', factoryId: containerFactories[1]?.id || 'cont-2', taskType: TASK_TYPES.CONTAINER.INJECTION_MOLDING, startDate: formatDate(addDays(today, -4)), endDate: formatDate(addDays(today, 1)), color: 'green', status: TaskStatus.IN_PROGRESS, projectId: 'proj-002' },
        
        // 포장 공장 태스크들 - 순차적으로 진행, 겹치지 않음 (두 번째 포장 공장 사용)
        { id: 12, factory: packagingFactories[1]?.name || '서울포장산업(주)', factoryId: packagingFactories[1]?.id || 'pack-2', taskType: TASK_TYPES.PACKAGING.LABEL_ATTACHMENT, startDate: formatDate(addDays(today, 10)), endDate: formatDate(addDays(today, 13)), color: 'orange', status: TaskStatus.PENDING, projectId: 'proj-002' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sch-003',
      projectId: 'proj-003',
      name: availableClients[2] ? `${availableClients[2]} - ${getRandomProductType()}` : `Client3-${getRandomProductType()}`,
      startDate: formatDate(addDays(today, -45)),
      endDate: formatDate(addDays(today, 15)),
      participants: [
        manufacturingFactories[2] && { id: manufacturingFactories[2].id, name: manufacturingFactories[2].name, period: `${formatDate(addDays(today, -45))} ~ ${formatDate(addDays(today, 15))}`, color: 'teal' },
        containerFactories[2] && { id: containerFactories[2].id, name: containerFactories[2].name, period: `${formatDate(addDays(today, -45))} ~ ${formatDate(addDays(today, 15))}`, color: 'indigo' }
      ].filter(Boolean),
      tasks: [
        // 제조 공장 태스크들 - 순차적으로 진행, 겹치지 않음 (세 번째 제조 공장 사용)
        ...(manufacturingFactories[2] ? [{
          id: 14, 
          factory: manufacturingFactories[2].name, 
          factoryId: manufacturingFactories[2].id, 
          taskType: TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT, 
          startDate: formatDate(addDays(today, -45)), 
          endDate: formatDate(addDays(today, -42)), 
          color: 'teal', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-003'
        },
        {
          id: 15, 
          factory: manufacturingFactories[2].name, 
          factoryId: manufacturingFactories[2].id, 
          taskType: TASK_TYPES.MANUFACTURING.MIXING, 
          startDate: formatDate(addDays(today, -41)), 
          endDate: formatDate(addDays(today, -35)), 
          color: 'teal', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-003'
        },
        {
          id: 17, 
          factory: manufacturingFactories[2].name, 
          factoryId: manufacturingFactories[2].id, 
          taskType: TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK, 
          startDate: formatDate(addDays(today, -34)), 
          endDate: formatDate(addDays(today, -30)), 
          color: 'teal', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-003'
        },
        {
          id: 18, 
          factory: manufacturingFactories[2].name, 
          factoryId: manufacturingFactories[2].id, 
          taskType: TASK_TYPES.MANUFACTURING.FINAL_INSPECTION, 
          startDate: formatDate(addDays(today, -29)), 
          endDate: formatDate(addDays(today, -25)), 
          color: 'teal', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-003'
        }] : []),
        
        // 용기 공장 태스크들 - 순차적으로 진행, 겹치지 않음 (세 번째 용기 공장 사용)
        ...(containerFactories[2] ? [{
          id: 16, 
          factory: containerFactories[2].name, 
          factoryId: containerFactories[2].id, 
          taskType: TASK_TYPES.CONTAINER.INJECTION_MOLDING, 
          startDate: formatDate(addDays(today, -24)), 
          endDate: formatDate(addDays(today, -20)), 
          color: 'indigo', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-003'
        }] : [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sch-004',
      projectId: 'proj-004',
      name: availableClients[3] ? `${availableClients[3]} - ${getRandomProductType()}` : `Client4-${getRandomProductType()}`,
      startDate: formatDate(addDays(today, 30)),
      endDate: formatDate(addDays(today, 90)),
      participants: [
        manufacturingFactories[3] && { id: manufacturingFactories[3].id, name: manufacturingFactories[3].name, period: `${formatDate(addDays(today, 30))} ~ ${formatDate(addDays(today, 90))}`, color: 'pink' }
      ].filter(Boolean),
      tasks: [
        // 제조 공장 태스크들 - 순차적으로 진행, 겹치지 않음 (네 번째 제조 공장 사용)
        ...(manufacturingFactories[3] ? [{
          id: 19, 
          factory: manufacturingFactories[3].name, 
          factoryId: manufacturingFactories[3].id, 
          taskType: TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT, 
          startDate: formatDate(addDays(today, 30)), 
          endDate: formatDate(addDays(today, 33)), 
          color: 'pink', 
          status: TaskStatus.PENDING, 
          projectId: 'proj-004'
        },
        {
          id: 20, 
          factory: manufacturingFactories[3].name, 
          factoryId: manufacturingFactories[3].id, 
          taskType: TASK_TYPES.MANUFACTURING.MIXING, 
          startDate: formatDate(addDays(today, 34)), 
          endDate: formatDate(addDays(today, 41)), 
          color: 'pink', 
          status: TaskStatus.PENDING, 
          projectId: 'proj-004'
        },
        {
          id: 21, 
          factory: manufacturingFactories[3].name, 
          factoryId: manufacturingFactories[3].id, 
          taskType: TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK, 
          startDate: formatDate(addDays(today, 42)), 
          endDate: formatDate(addDays(today, 47)), 
          color: 'pink', 
          status: TaskStatus.PENDING, 
          projectId: 'proj-004'
        }] : [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sch-005',
      projectId: 'proj-005',
      name: availableClients[0] ? `${availableClients[0]} - ${getRandomProductType()}` : `Client5-${getRandomProductType()}`,
      startDate: formatDate(addDays(today, -60)),
      endDate: formatDate(addDays(today, -15)),
      participants: [
        manufacturingFactories[4] && { id: manufacturingFactories[4].id, name: manufacturingFactories[4].name, period: `${formatDate(addDays(today, -60))} ~ ${formatDate(addDays(today, -15))}`, color: 'gray' }
      ].filter(Boolean),
      tasks: [
        // 제조 공장 태스크들 - 순차적으로 진행, 겹치지 앎음 (다섯 번째 제조 공장 사용)
        ...(manufacturingFactories[4] ? [{
          id: 22, 
          factory: manufacturingFactories[4].name, 
          factoryId: manufacturingFactories[4].id, 
          taskType: TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT, 
          startDate: formatDate(addDays(today, -60)), 
          endDate: formatDate(addDays(today, -57)), 
          color: 'gray', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-005'
        },
        {
          id: 23, 
          factory: manufacturingFactories[4].name, 
          factoryId: manufacturingFactories[4].id, 
          taskType: TASK_TYPES.MANUFACTURING.MIXING, 
          startDate: formatDate(addDays(today, -56)), 
          endDate: formatDate(addDays(today, -49)), 
          color: 'gray', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-005'
        },
        {
          id: 24, 
          factory: manufacturingFactories[4].name, 
          factoryId: manufacturingFactories[4].id, 
          taskType: TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK, 
          startDate: formatDate(addDays(today, -48)), 
          endDate: formatDate(addDays(today, -41)), 
          color: 'gray', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-005'
        },
        {
          id: 25, 
          factory: manufacturingFactories[4].name, 
          factoryId: manufacturingFactories[4].id, 
          taskType: TASK_TYPES.MANUFACTURING.FINAL_INSPECTION, 
          startDate: formatDate(addDays(today, -40)), 
          endDate: formatDate(addDays(today, -33)), 
          color: 'gray', 
          status: TaskStatus.COMPLETED, 
          projectId: 'proj-005'
        }] : [])
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  // 생성된 스케줄 검증
  if (process.env.NODE_ENV === 'development') {
    schedules.forEach(schedule => {
      const validation = validateSchedule(schedule);
      if (!validation.isValid) {
        // Validation errors are handled silently
      }
    });
  }
  
  return schedules;
};

// 스케줄에서 프로젝트 정보 추출
export interface ProjectFromSchedule {
  id: string;
  client: string;
  productType: string;
  manager: string;
  serviceType: 'OEM' | 'ODM' | 'OBM' | 'Private Label' | 'White Label';
  currentStage: string[];
  status: string; // Will use ProjectStatusLabel values
  progress: number;
  startDate: string;
  endDate: string;
  manufacturer: string;
  container: string;
  packaging: string;
  sales: string;
  purchase: string;
  priority: string; // Will use PriorityLabel values
}

export const extractProjectFromSchedule = (schedule: Schedule): ProjectFromSchedule => {
  const [client, productType] = schedule.name.split(' - ');
  
  // 태스크에서 현재 단계 추출
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentStages = schedule.tasks
    .filter(task => {
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      return task.status === TaskStatus.IN_PROGRESS && startDate <= today && endDate >= today;
    })
    .map(task => task.taskType);
  
  // 진행률 계산
  const completedTasks = schedule.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = schedule.tasks.length;
  const progress = Math.round((completedTasks / totalTasks) * 100);
  
  // 상태 계산
  let status = ProjectStatusLabel[ProjectStatus.PLANNING];
  if (schedule.tasks.every(t => t.status === TaskStatus.COMPLETED)) {
    status = ProjectStatusLabel[ProjectStatus.COMPLETED];
  } else if (schedule.tasks.some(t => t.status === TaskStatus.IN_PROGRESS)) {
    status = ProjectStatusLabel[ProjectStatus.IN_PROGRESS];
  } else if (schedule.tasks.some(t => t.status === TaskStatus.COMPLETED)) {
    status = ProjectStatusLabel[ProjectStatus.IN_PROGRESS];
  }
  
  // 참여 공장 분류 - Mock DB에서 공장 타입별로 분류
  const manufacturingFactories = mockDataService.getFactoriesByType(FACTORY_TYPES.MANUFACTURING);
  const containerFactories = mockDataService.getFactoriesByType(FACTORY_TYPES.CONTAINER);
  const packagingFactories = mockDataService.getFactoriesByType(FACTORY_TYPES.PACKAGING);
  
  const manufacturer = schedule.participants.find(p => 
    manufacturingFactories.some(f => f.name === p.name)
  )?.name || '';
  const container = schedule.participants.find(p => 
    containerFactories.some(f => f.name === p.name)
  )?.name || '';
  const packaging = schedule.participants.find(p => 
    packagingFactories.some(f => f.name === p.name)
  )?.name || '';
  
  return {
    id: schedule.projectId,
    client,
    productType,
    manager: getRandomManager(),
    serviceType: Object.values(ServiceTypeLabel).filter(v => v !== ServiceTypeLabel[ServiceType.OTHER])[Math.floor(Math.random() * 5)],
    currentStage: currentStages,
    status,
    progress,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    manufacturer,
    container,
    packaging,
    sales: `${Math.floor(Math.random() * 2000000000) + 300000000}`,
    purchase: `${Math.floor(Math.random() * 1000000000) + 200000000}`,
    priority: progress < 30 ? PriorityLabel[Priority.LOW] : progress > 70 ? PriorityLabel[Priority.HIGH] : PriorityLabel[Priority.MEDIUM]
  };
};