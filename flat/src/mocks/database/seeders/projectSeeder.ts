import { Project, ProjectType, ProjectStatus } from '@/types/project';
import { Customer } from '@/types/customer';
import { User } from '@/types/user';

export const createProjects = (customers: Customer[], users: User[]): Project[] => {
  const currentDate = new Date();
  
  // Find specific users for consistency
  const pmUser = users.find(u => u.id === 'user-2')!; // 이영희
  const pmUser2 = users.find(u => u.id === 'user-6')!; // 강미나
  const customer1 = customers.find(c => c.id === 'customer-1')!;
  const customer2 = customers.find(c => c.id === 'customer-2')!;
  const customer3 = customers.find(c => c.id === 'customer-3')!;
  const customer4 = customers.find(c => c.id === 'customer-4')!;

  // Create synchronized project dates dynamically
  const { masterProjects, subProjects } = createSynchronizedProjects(
    [customer1, customer2, customer3, customer4], 
    [pmUser, pmUser2], 
    currentDate
  );

  return [...masterProjects, ...subProjects];
};

/**
 * Creates synchronized Master and Sub projects with various statuses
 */
function createSynchronizedProjects(
  customers: Customer[], 
  pmUsers: User[], 
  currentDate: Date
) {
  const masterProjects: Project[] = [];
  const subProjects: Project[] = [];

  // MASTER 프로젝트 1: 프리미엄 화장품 라인
  const master1Start = new Date(currentDate);
  master1Start.setDate(master1Start.getDate() - 30); // 30일 전 시작
  const master1End = new Date(currentDate);
  master1End.setDate(master1End.getDate() + 60); // 60일 후 종료

  masterProjects.push({
    id: 'master-1',
    projectNumber: 'PRJ-2025-001',
    name: '프리미엄 화장품 라인',
    type: ProjectType.MASTER,
    status: ProjectStatus.IN_PROGRESS,
    customerId: customers[0].id,
    customer: {
      id: customers[0].id,
      name: customers[0].name,
      contactPerson: customers[0].contactPerson,
      contactNumber: customers[0].contactNumber,
      email: customers[0].email,
    },
    product: {
      name: '프리미엄 라인',
      volume: 'Various',
      unitPrice: 35000,
    },
    quantity: 50000,
    totalAmount: 1750000000,
    depositAmount: 525000000,
    depositStatus: 'received',
    startDate: master1Start,
    endDate: master1End,
    manufacturerId: 'factory-1',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: 'high',
    progress: 45,
    scheduleId: 'schedule-1',
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 35 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // MASTER 프로젝트 2: 천연 화장품 시리즈
  const master2Start = new Date(currentDate);
  master2Start.setDate(master2Start.getDate() - 45); // 45일 전 시작
  const master2End = new Date(currentDate);
  master2End.setDate(master2End.getDate() + 75); // 75일 후 종료

  masterProjects.push({
    id: 'master-2',
    projectNumber: 'PRJ-2025-002',
    name: '천연 화장품 시리즈',
    type: ProjectType.MASTER,
    status: ProjectStatus.IN_PROGRESS,
    customerId: customers[1].id,
    customer: {
      id: customers[1].id,
      name: customers[1].name,
      contactPerson: customers[1].contactPerson,
      contactNumber: customers[1].contactNumber,
      email: customers[1].email,
    },
    product: {
      name: '천연 라인',
      volume: 'Various',
      unitPrice: 28000,
    },
    quantity: 40000,
    totalAmount: 1120000000,
    depositAmount: 336000000,
    depositStatus: 'received',
    startDate: master2Start,
    endDate: master2End,
    manufacturerId: 'factory-4',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: 'high',
    progress: 30,
    scheduleId: 'schedule-2',
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 50 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // SUB 프로젝트들 - MASTER 1의 자식들
  // SUB 1-1: 프리미엄 에센스 (진행중)
  const sub1_1Start = new Date(master1Start);
  sub1_1Start.setDate(sub1_1Start.getDate() + 10);
  const sub1_1End = new Date(master1End);
  sub1_1End.setDate(sub1_1End.getDate() - 10);

  subProjects.push({
    id: 'sub-1-1',
    projectNumber: 'PRJ-2025-001-A',
    name: '프리미엄 에센스',
    type: ProjectType.SUB,
    parentId: 'master-1',
    status: ProjectStatus.IN_PROGRESS,
    customerId: customers[0].id,
    customer: {
      id: customers[0].id,
      name: customers[0].name,
      contactPerson: customers[0].contactPerson,
      contactNumber: customers[0].contactNumber,
      email: customers[0].email,
    },
    product: {
      name: '프리미엄 에센스',
      volume: '50ml',
      unitPrice: 35000,
    },
    quantity: 10000,
    totalAmount: 350000000,
    depositAmount: 105000000,
    depositStatus: 'received',
    startDate: sub1_1Start,
    endDate: sub1_1End,
    manufacturerId: 'factory-1',
    containerId: null,
    packagingId: null,
    priority: 'high',
    progress: 60,
    scheduleId: 'schedule-3',
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // SUB 1-2: 프리미엄 크림 (시작전)
  const sub1_2Start = new Date(master1Start);
  sub1_2Start.setDate(sub1_2Start.getDate() + 30);
  const sub1_2End = new Date(master1End);
  sub1_2End.setDate(sub1_2End.getDate() - 5);

  subProjects.push({
    id: 'sub-1-2',
    projectNumber: 'PRJ-2025-001-B',
    name: '프리미엄 크림',
    type: ProjectType.SUB,
    parentId: 'master-1',
    status: ProjectStatus.PLANNING,
    customerId: customers[0].id,
    customer: {
      id: customers[0].id,
      name: customers[0].name,
      contactPerson: customers[0].contactPerson,
      contactNumber: customers[0].contactNumber,
      email: customers[0].email,
    },
    product: {
      name: '프리미엄 크림',
      volume: '50ml',
      unitPrice: 42000,
    },
    quantity: 8000,
    totalAmount: 336000000,
    depositAmount: 100800000,
    depositStatus: 'pending',
    startDate: sub1_2Start,
    endDate: sub1_2End,
    manufacturerId: 'factory-1',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: 'medium',
    progress: 0,
    scheduleId: 'schedule-4',
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // SUB 프로젝트들 - MASTER 2의 자식들
  // SUB 2-1: 천연 샴푸 (진행중)
  const sub2_1Start = new Date(master2Start);
  sub2_1Start.setDate(sub2_1Start.getDate() + 5);
  const sub2_1End = new Date(master2End);
  sub2_1End.setDate(sub2_1End.getDate() - 20);

  subProjects.push({
    id: 'sub-2-1',
    projectNumber: 'PRJ-2025-002-A',
    name: '천연 샴푸',
    type: ProjectType.SUB,
    parentId: 'master-2',
    status: ProjectStatus.IN_PROGRESS,
    customerId: customers[1].id,
    customer: {
      id: customers[1].id,
      name: customers[1].name,
      contactPerson: customers[1].contactPerson,
      contactNumber: customers[1].contactNumber,
      email: customers[1].email,
    },
    product: {
      name: '천연 샴푸',
      volume: '500ml',
      unitPrice: 18000,
    },
    quantity: 15000,
    totalAmount: 270000000,
    depositAmount: 81000000,
    depositStatus: 'received',
    startDate: sub2_1Start,
    endDate: sub2_1End,
    manufacturerId: 'factory-4',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: 'high',
    progress: 40,
    scheduleId: 'schedule-5',
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 40 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // 독립적인 SUB 프로젝트들 (parentId 없음)
  // 독립 SUB 1: 선크림 (진행중)
  const indSub1Start = new Date(currentDate);
  indSub1Start.setDate(indSub1Start.getDate() - 60);
  const indSub1End = new Date(currentDate);
  indSub1End.setDate(indSub1End.getDate() + 20);

  subProjects.push({
    id: 'sub-ind-1',
    projectNumber: 'PRJ-2025-101',
    name: '선크림 SPF50+',
    type: ProjectType.SUB,
    // parentId 없음 - 독립적인 SUB 프로젝트
    status: ProjectStatus.IN_PROGRESS,
    customerId: customers[2].id,
    customer: {
      id: customers[2].id,
      name: customers[2].name,
      contactPerson: customers[2].contactPerson,
      contactNumber: customers[2].contactNumber,
      email: customers[2].email,
    },
    product: {
      name: '선크림',
      volume: '50ml',
      unitPrice: 25000,
    },
    quantity: 12000,
    totalAmount: 300000000,
    depositAmount: 90000000,
    depositStatus: 'received',
    startDate: indSub1Start,
    endDate: indSub1End,
    manufacturerId: 'factory-1',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: 'high',
    progress: 75,
    scheduleId: 'schedule-6',
    createdBy: pmUsers[1].id,
    createdAt: new Date(currentDate.getTime() - 65 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // 독립 SUB 2: 클렌징 폼 (완료)
  const indSub2Start = new Date(currentDate);
  indSub2Start.setDate(indSub2Start.getDate() - 90);
  const indSub2End = new Date(currentDate);
  indSub2End.setDate(indSub2End.getDate() - 5);

  subProjects.push({
    id: 'sub-ind-2',
    projectNumber: 'PRJ-2025-102',
    name: '클렌징 폼',
    type: ProjectType.SUB,
    // parentId 없음 - 독립적인 SUB 프로젝트
    status: ProjectStatus.COMPLETED,
    customerId: customers[3].id,
    customer: {
      id: customers[3].id,
      name: customers[3].name,
      contactPerson: customers[3].contactPerson,
      contactNumber: customers[3].contactNumber,
      email: customers[3].email,
    },
    product: {
      name: '클렌징 폼',
      volume: '150ml',
      unitPrice: 12000,
    },
    quantity: 20000,
    totalAmount: 240000000,
    depositAmount: 72000000,
    depositStatus: 'received',
    startDate: indSub2Start,
    endDate: indSub2End,
    manufacturerId: 'factory-4',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: 'medium',
    progress: 100,
    scheduleId: 'schedule-7',
    createdBy: pmUsers[1].id,
    createdAt: new Date(currentDate.getTime() - 95 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000),
  });

  // 독립 SUB 3: 미스트 (중단)
  const indSub3Start = new Date(currentDate);
  indSub3Start.setDate(indSub3Start.getDate() - 40);
  const indSub3End = new Date(currentDate);
  indSub3End.setDate(indSub3End.getDate() + 50);

  subProjects.push({
    id: 'sub-ind-3',
    projectNumber: 'PRJ-2025-103',
    name: '페이셜 미스트',
    type: ProjectType.SUB,
    // parentId 없음 - 독립적인 SUB 프로젝트
    status: ProjectStatus.CANCELLED,
    customerId: customers[0].id,
    customer: {
      id: customers[0].id,
      name: customers[0].name,
      contactPerson: customers[0].contactPerson,
      contactNumber: customers[0].contactNumber,
      email: customers[0].email,
    },
    product: {
      name: '페이셜 미스트',
      volume: '100ml',
      unitPrice: 15000,
    },
    quantity: 10000,
    totalAmount: 150000000,
    depositAmount: 45000000,
    depositStatus: 'pending',
    startDate: indSub3Start,
    endDate: indSub3End,
    manufacturerId: 'factory-1',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: 'low',
    progress: 20,
    scheduleId: 'schedule-8',
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000),
  });


  return { masterProjects, subProjects };
}