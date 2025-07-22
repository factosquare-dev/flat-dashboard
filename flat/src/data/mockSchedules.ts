import type { Schedule, Task } from '../types/schedule';

// 날짜 계산 함수
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 테스트용 스케줄 데이터 생성
export const createMockSchedules = (): Schedule[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const schedules: Schedule[] = [
    {
      id: 'sch-001',
      projectId: 'proj-001',
      name: '(주)뷰티코리아 - 안티에이징 세럼',
      startDate: formatDate(addDays(today, -30)),
      endDate: formatDate(addDays(today, 60)),
      participants: [
        { id: 'mfg-1', name: '큐셀시스템', period: `${formatDate(addDays(today, -30))} ~ ${formatDate(addDays(today, 60))}`, color: 'blue' },
        { id: 'cont-1', name: '(주)연우', period: `${formatDate(addDays(today, -30))} ~ ${formatDate(addDays(today, 60))}`, color: 'red' },
        { id: 'pack-1', name: '(주)네트모베이지', period: `${formatDate(addDays(today, -30))} ~ ${formatDate(addDays(today, 60))}`, color: 'yellow' }
      ],
      tasks: [
        // 완료된 태스크들
        { id: 1, factory: '큐셀시스템', taskType: '원료 준비', startDate: formatDate(addDays(today, -30)), endDate: formatDate(addDays(today, -27)), color: 'blue', status: 'completed', projectId: 'proj-001' },
        { id: 2, factory: '큐셀시스템', taskType: '혼합 및 제조', startDate: formatDate(addDays(today, -26)), endDate: formatDate(addDays(today, -20)), color: 'blue', status: 'completed', projectId: 'proj-001' },
        { id: 3, factory: '(주)연우', taskType: '금형 제작', startDate: formatDate(addDays(today, -25)), endDate: formatDate(addDays(today, -16)), color: 'red', status: 'completed', projectId: 'cont-1' },
        
        // 지연된 태스크 (뷰티코리아)
        { id: 4, factory: '큐셀시스템', taskType: '안정성 테스트', startDate: formatDate(addDays(today, -10)), endDate: formatDate(addDays(today, -3)), color: 'blue', status: 'in-progress', projectId: 'proj-001', assignee: '김철수' },
        
        // 진행중인 태스크들
        { id: 6, factory: '(주)연우', taskType: '사출 성형', startDate: formatDate(addDays(today, -3)), endDate: formatDate(addDays(today, 4)), color: 'red', status: 'in-progress', projectId: 'cont-1' },
        
        // 예정된 태스크들
        { id: 7, factory: '(주)네트모베이지', taskType: '디자인 작업', startDate: formatDate(addDays(today, 5)), endDate: formatDate(addDays(today, 10)), color: 'yellow', status: 'pending', projectId: 'proj-001' },
        { id: 8, factory: '(주)네트모베이지', taskType: '포장 작업', startDate: formatDate(addDays(today, 11)), endDate: formatDate(addDays(today, 15)), color: 'yellow', status: 'pending', projectId: 'proj-001' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sch-002',
      projectId: 'proj-002',
      name: '글로벌코스메틱 - 비비크림',
      startDate: formatDate(addDays(today, -20)),
      endDate: formatDate(addDays(today, 40)),
      participants: [
        { id: 'cosmos-001', name: '주식회사 코스모로스', period: `${formatDate(addDays(today, -20))} ~ ${formatDate(addDays(today, 40))}`, color: 'purple' },
        { id: 'samhwa-001', name: '삼화플라스틱', period: `${formatDate(addDays(today, -20))} ~ ${formatDate(addDays(today, 40))}`, color: 'green' },
        { id: 'seshin-001', name: '(주)세신상사', period: `${formatDate(addDays(today, -20))} ~ ${formatDate(addDays(today, 40))}`, color: 'orange' }
      ],
      tasks: [
        // 완료된 태스크들
        { id: 9, factory: '주식회사 코스모로스', taskType: '원료 준비', startDate: formatDate(addDays(today, -20)), endDate: formatDate(addDays(today, -17)), color: 'purple', status: 'completed', projectId: 'proj-002' },
        
        // 진행중인 태스크들
        { id: 10, factory: '주식회사 코스모로스', taskType: '혼합 및 제조', startDate: formatDate(addDays(today, -10)), endDate: formatDate(addDays(today, 5)), color: 'purple', status: 'in-progress', projectId: 'proj-002' },
        { id: 11, factory: '삼화플라스틱', taskType: '용기 제작', startDate: formatDate(addDays(today, -2)), endDate: formatDate(addDays(today, 3)), color: 'green', status: 'in-progress', projectId: 'proj-002' },
        
        // 예정된 태스크들
        { id: 12, factory: '(주)세신상사', taskType: '라벨링', startDate: formatDate(addDays(today, 10)), endDate: formatDate(addDays(today, 12)), color: 'orange', status: 'pending', projectId: 'proj-002' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sch-003',
      projectId: 'proj-003',
      name: '네이처바이오 - 탈모샴푸',
      startDate: formatDate(addDays(today, -45)),
      endDate: formatDate(addDays(today, 15)),
      participants: [
        { id: 'beautyfactory-001', name: '(주)뷰티팩토리', period: `${formatDate(addDays(today, -45))} ~ ${formatDate(addDays(today, 15))}`, color: 'teal' },
        { id: 'hpc-001', name: '(주)에이치피씨', period: `${formatDate(addDays(today, -45))} ~ ${formatDate(addDays(today, 15))}`, color: 'indigo' }
      ],
      tasks: [
        // 대부분 완료된 태스크들
        { id: 13, factory: '(주)뷰티팩토리', taskType: '원료 준비', startDate: formatDate(addDays(today, -45)), endDate: formatDate(addDays(today, -42)), color: 'teal', status: 'completed', projectId: 'proj-003' },
        { id: 14, factory: '(주)뷰티팩토리', taskType: '혼합 및 제조', startDate: formatDate(addDays(today, -41)), endDate: formatDate(addDays(today, -35)), color: 'teal', status: 'completed', projectId: 'proj-003' },
        { id: 15, factory: '(주)뷰티팩토리', taskType: '품질 검사', startDate: formatDate(addDays(today, -34)), endDate: formatDate(addDays(today, -30)), color: 'teal', status: 'completed', projectId: 'proj-003' },
        { id: 16, factory: '(주)에이치피씨', taskType: '용기 제작', startDate: formatDate(addDays(today, -40)), endDate: formatDate(addDays(today, -32)), color: 'indigo', status: 'completed', projectId: 'proj-003' },
        
        // 진행중인 마지막 태스크
        { id: 17, factory: '(주)뷰티팩토리', taskType: '최종 승인', startDate: formatDate(addDays(today, -1)), endDate: formatDate(addDays(today, 1)), color: 'teal', status: 'in-progress', projectId: 'proj-003' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sch-004',
      projectId: 'proj-004',
      name: '프리미엄뷰티 - 바디로션',
      startDate: formatDate(addDays(today, 30)),
      endDate: formatDate(addDays(today, 90)),
      participants: [
        { id: 'cosmeca-001', name: '코스메카코리아', period: `${formatDate(addDays(today, 30))} ~ ${formatDate(addDays(today, 90))}`, color: 'pink' }
      ],
      tasks: [
        // 모든 태스크가 예정됨
        { id: 18, factory: '코스메카코리아', taskType: '원료 준비', startDate: formatDate(addDays(today, 30)), endDate: formatDate(addDays(today, 33)), color: 'pink', status: 'pending', projectId: 'proj-004' },
        { id: 19, factory: '코스메카코리아', taskType: '혼합 및 제조', startDate: formatDate(addDays(today, 34)), endDate: formatDate(addDays(today, 41)), color: 'pink', status: 'pending', projectId: 'proj-004' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sch-005',
      projectId: 'proj-005',
      name: '클린뷰티랩 - 선크림',
      startDate: formatDate(addDays(today, -60)),
      endDate: formatDate(addDays(today, -15)),
      participants: [
        { id: 'amorepacific-001', name: '(주)아모레퍼시픽 오산공장', period: `${formatDate(addDays(today, -60))} ~ ${formatDate(addDays(today, -15))}`, color: 'gray' }
      ],
      tasks: [
        // 모든 태스크가 완료됨
        { id: 20, factory: '(주)아모레퍼시픽 오산공장', taskType: '원료 준비', startDate: formatDate(addDays(today, -60)), endDate: formatDate(addDays(today, -57)), color: 'gray', status: 'completed', projectId: 'proj-005' },
        { id: 21, factory: '(주)아모레퍼시픽 오산공장', taskType: '혼합 및 제조', startDate: formatDate(addDays(today, -56)), endDate: formatDate(addDays(today, -49)), color: 'gray', status: 'completed', projectId: 'proj-005' },
        { id: 22, factory: '(주)아모레퍼시픽 오산공장', taskType: '품질 검사', startDate: formatDate(addDays(today, -48)), endDate: formatDate(addDays(today, -45)), color: 'gray', status: 'completed', projectId: 'proj-005' },
        { id: 23, factory: '(주)아모레퍼시픽 오산공장', taskType: '최종 승인', startDate: formatDate(addDays(today, -20)), endDate: formatDate(addDays(today, -15)), color: 'gray', status: 'completed', projectId: 'proj-005' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
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
  status: '시작전' | '진행중' | '완료';
  progress: number;
  startDate: string;
  endDate: string;
  manufacturer: string;
  container: string;
  packaging: string;
  sales: string;
  purchase: string;
  priority: '높음' | '보통' | '낮음';
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
      return task.status === 'in-progress' && startDate <= today && endDate >= today;
    })
    .map(task => task.taskType);
  
  // 진행률 계산
  const completedTasks = schedule.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = schedule.tasks.length;
  const progress = Math.round((completedTasks / totalTasks) * 100);
  
  // 상태 계산
  let status: '시작전' | '진행중' | '완료' = '시작전';
  if (schedule.tasks.every(t => t.status === 'completed')) {
    status = '완료';
  } else if (schedule.tasks.some(t => t.status === 'in-progress')) {
    status = '진행중';
  } else if (schedule.tasks.some(t => t.status === 'completed')) {
    status = '진행중';
  }
  
  // 참여 공장 분류
  const manufacturer = schedule.participants.find(p => ['큐셀시스템', '주식회사 코스모로스', '(주)뷰티팩토리', '코스메카코리아', '(주)아모레퍼시픽 오산공장'].includes(p.name))?.name || '';
  const container = schedule.participants.find(p => ['(주)연우', '삼화플라스틱', '(주)에이치피씨'].includes(p.name))?.name || '';
  const packaging = schedule.participants.find(p => ['(주)네트모베이지', '(주)세신상사'].includes(p.name))?.name || '';
  
  return {
    id: schedule.projectId,
    client,
    productType,
    manager: ['김철수', '이영희', '박민수', '정수진', '최지훈'][Math.floor(Math.random() * 5)],
    serviceType: ['OEM', 'ODM', 'OBM', 'Private Label', 'White Label'][Math.floor(Math.random() * 5)] as any,
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
    priority: progress < 30 ? '낮음' : progress > 70 ? '높음' : '보통'
  };
};