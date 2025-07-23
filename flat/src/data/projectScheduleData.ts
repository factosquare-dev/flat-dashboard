import type { Project } from '../types/project';
import type { Schedule, Task, Participant } from '../types/schedule';
import { projectFactories } from './mockData';
import { formatDateISO } from '../utils/dateUtils';

// 태스크 타입별 기간 (일)
const TASK_DURATIONS = {
  'PCB 설계': 7,
  'SMT 작업': 5,
  '최종 조립': 3,
  '품질 검사': 2,
  '포장': 2,
  '금형 제작': 10,
  '사출 성형': 7,
  '도장 작업': 4,
  '조립': 3,
  '검수': 2,
  '회로 설계': 8,
  '펌웨어 개발': 14,
  '하드웨어 테스트': 5,
  '인증 시험': 7,
  '기구 설계': 10,
  '시제품 제작': 5,
  '성능 테스트': 3,
  '양산 준비': 7,
  '샘플 제작': 5,
  '디자인 검토': 3,
  '최종 승인': 2,
  // 제조 공장 태스크
  '원료 준비': 3,
  '혼합 및 제조': 7,
  '안정성 테스트': 5,
  // 용기 공장 태스크
  '표면 처리': 3,
  '품질 검수': 2,
  '포장 준비': 2,
  // 포장 공장 태스크
  '디자인 작업': 5,
  '인쇄 준비': 3,
  '포장 작업': 4,
  '라벨링': 2,
  '최종 품질 검사': 2
};

// 공장 타입별 태스크 목록
const FACTORY_TYPE_TASKS: { [key: string]: string[] } = {
  '제조': ['원료 준비', '혼합 및 제조', '품질 검사', '안정성 테스트', '최종 승인'],
  '용기': ['금형 제작', '사출 성형', '표면 처리', '품질 검수', '포장 준비'],
  '포장': ['디자인 작업', '인쇄 준비', '포장 작업', '라벨링', '최종 품질 검사'],
  'default': ['샘플 제작', '디자인 검토', '품질 검사', '최종 승인']
};

// 공장별 태스크 목록 (특정 공장에 특화된 태스크)
const FACTORY_TASKS: { [key: string]: string[] } = {
  '큐셀시스템': ['PCB 설계', 'SMT 작업', '최종 조립', '품질 검사', '포장'],
  '(주)연우': ['금형 제작', '사출 성형', '도장 작업', '조립', '검수'],
  '(주)네트모베이지': ['회로 설계', '펌웨어 개발', '하드웨어 테스트', '인증 시험'],
  '주식회사 코스모로스': ['기구 설계', '시제품 제작', '성능 테스트', '양산 준비']
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

// 공장별 담당자 매핑
const getAssigneeForFactory = (factoryName: string): string => {
  const assigneeMap: { [key: string]: string } = {
    '큐셀시스템': '김철수',
    '(주)연우': '이영희',
    '(주)네트모베이지': '정수진',
    '주식회사 코스모로스': '최현우',
    // 추가 공장들
    '삼성전자': '박민수',
    'LG화학': '홍길동',
    '아모레퍼시픽': '김영희',
    '한국콜마': '이철수'
  };
  
  // 공장명에서 키워드를 찾아서 매핑
  for (const [key, assignee] of Object.entries(assigneeMap)) {
    if (factoryName.includes(key)) {
      return assignee;
    }
  }
  
  return '담당자'; // 기본값
};

// 프로젝트 진행률에 따른 태스크 생성
export const generateTasksForProject = (project: Project, factories: ProjectFactory[]): Task[] => {
  const tasks: Task[] = [];
  let taskId = 1;
  const projectStartDate = new Date(project.startDate);
  const projectEndDate = new Date(project.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 프로젝트 상태에 따른 태스크 생성 로직
  const isProjectStarted = today >= projectStartDate;
  const isProjectEnded = today > projectEndDate;
  
  factories.forEach((factory, factoryIndex) => {
    // 공장 타입 확인 (제조/용기/포장)
    let factoryType = 'default';
    if (factory.name === project.manufacturer) factoryType = '제조';
    else if (factory.name === project.container) factoryType = '용기';
    else if (factory.name === project.packaging) factoryType = '포장';
    
    // 특정 공장에 특화된 태스크가 있으면 사용, 없으면 타입별 태스크 사용
    const factoryTasks = FACTORY_TASKS[factory.name] || FACTORY_TYPE_TASKS[factoryType] || FACTORY_TYPE_TASKS['default'];
    
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
      } else if (project.status === '완료') {
        status = 'completed';
      } else if (project.status === '시작전') {
        status = 'pending';
      } else if (project.status === '진행중') {
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
        assignee: getAssigneeForFactory(factory.name),
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
  const factories = projectFactories[project.id] || [
    { name: project.manufacturer, color: 'bg-blue-500' },
    { name: project.container, color: 'bg-red-500' },
    { name: project.packaging, color: 'bg-yellow-500' }
  ];
  
  
  const participants: Participant[] = factories.map(factory => ({
    id: factory.name,
    name: factory.name,
    period: `${project.startDate} ~ ${project.endDate}`,
    color: factory.color.replace('bg-', '').replace('-500', '')
  }));
  
  const tasks = generateTasksForProject(project, factories);
  
  
  // 고유한 스케줄 ID 생성
  const scheduleId = `schedule-${project.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id: scheduleId,
    projectId: project.id,
    name: `${project.client} - ${project.productType}`,
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
  const tasks: Task[] = [
    {
      id: 101,
      factory: '큐셀시스템',
      taskType: 'SMT 작업',
      startDate: formatDate(addDays(today, -2)),
      endDate: formatDate(addDays(today, 3)),
      color: 'blue',
      status: 'in-progress',
      projectId: '1'
    },
    {
      id: 102,
      factory: '(주)연우',
      taskType: '사출 성형',
      startDate: formatDate(addDays(today, -1)),
      endDate: formatDate(addDays(today, 6)),
      color: 'red',
      status: 'in-progress',
      projectId: '1'
    },
    {
      id: 103,
      factory: '(주)네트모베이지',
      taskType: '펌웨어 개발',
      startDate: formatDate(addDays(today, -5)),
      endDate: formatDate(addDays(today, 9)),
      color: 'yellow',
      status: 'in-progress',
      projectId: '2'
    },
    {
      id: 104,
      factory: '주식회사 코스모로스',
      taskType: '시제품 제작',
      startDate: formatDate(today),
      endDate: formatDate(addDays(today, 5)),
      color: 'cyan',
      status: 'in-progress',
      projectId: '3'
    },
    {
      id: 105,
      factory: '큐셀시스템',
      taskType: '품질 검사',
      startDate: formatDate(addDays(today, -1)),
      endDate: formatDate(addDays(today, 1)),
      color: 'blue',
      status: 'in-progress',
      projectId: '3'
    }
  ];
  
  return tasks;
};

interface ProjectFactory {
  name: string;
  color: string;
}