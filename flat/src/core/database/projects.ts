import type { Project } from '@/shared/types/project';
import { projectColors } from '@/core/database/mockData';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: '프리미엄 안티에이징 세럼 개발',
    description: '고농축 펩타이드 성분을 활용한 프리미엄 안티에이징 세럼 개발 프로젝트',
    status: 'active',
    priority: 'high',
    progress: 75,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    budget: 150000000,
    customerId: 'customer-1',
    customerName: '뷰티코리아',
    manager: '김철수',
    productType: '스킨케어',
    serviceType: 'ODM',
    currentStage: ['제조'],
    color: projectColors[0],
  },
  {
    id: '2', 
    name: '천연 샴푸 시리즈 개발',
    description: '식물성 계면활성제를 사용한 친환경 샴푸 라인 개발',
    status: 'active',
    priority: 'medium',
    progress: 45,
    startDate: '2024-02-01',
    endDate: '2024-08-15',
    budget: 80000000,
    customerId: 'customer-2',
    customerName: '그린코스메틱',
    manager: '이영희',
    productType: '헤어케어',
    serviceType: 'OEM',
    currentStage: ['설계'],
    color: projectColors[1],
  },
  {
    id: '3',
    name: '비비크림 신제품 라인',
    description: 'SPF50+ PA+++ 자외선 차단 기능이 있는 비비크림 개발',
    status: 'completed',
    priority: 'high',
    progress: 100,
    startDate: '2023-10-01',
    endDate: '2024-03-31',
    budget: 120000000,
    customerId: 'customer-3',
    customerName: '코스메디칼',
    manager: '박민수',
    productType: '메이크업',
    serviceType: 'ODM',
    currentStage: ['승인'],
    color: projectColors[2],
  },
  {
    id: '4',
    name: '탈모 방지 샴푸 개발',
    description: '탈모 증상 완화를 위한 기능성 샴푸 개발 프로젝트',
    status: 'planning',
    priority: 'medium',
    progress: 15,
    startDate: '2024-03-01',
    endDate: '2024-10-30',
    budget: 95000000,
    customerId: 'customer-4',
    customerName: '퍼스트뷰티',
    manager: '정수진',
    productType: '헤어케어',
    serviceType: 'OEM',
    currentStage: ['설계'],
    color: projectColors[3],
  },
  {
    id: '5',
    name: '보습 바디로션 개발',
    description: '건성 피부용 고보습 바디로션 개발',
    status: 'active',
    priority: 'low',
    progress: 60,
    startDate: '2024-01-20',
    endDate: '2024-07-15',
    budget: 65000000,
    customerId: 'customer-1',
    customerName: '뷰티코리아',
    manager: '최지훈',
    productType: '바디케어',
    serviceType: 'OEM',
    currentStage: ['용기'],
    color: projectColors[4],
  }
];

export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const getProjectsByStatus = (status: string): Project[] => {
  return mockProjects.filter(project => project.status === status);
};

export const getProjectsByCustomer = (customerId: string): Project[] => {
  return mockProjects.filter(project => project.customerId === customerId);
};