import { Project, ProjectType, ProjectStatus, ServiceType, Priority, DepositStatus } from '@/types/project';
import { ProductType } from '@/types/enums';
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
  const master1Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master1Start.setUTCDate(master1Start.getUTCDate() - 30); // 30일 전 시작
  const master1End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master1End.setUTCDate(master1End.getUTCDate() + 60); // 60일 후 종료

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
    depositStatus: DepositStatus.RECEIVED,
    startDate: master1Start,
    endDate: master1End,
    manufacturerId: 'factory-1',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: Priority.HIGH,
    progress: 45,
    scheduleId: 'schedule-1',
    productType: ProductType.SKINCARE,
    serviceType: ServiceType.ODM,
    depositPaid: true,
    managerId: pmUsers[0].id,
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 35 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // MASTER 프로젝트 2: 천연 화장품 시리즈
  const master2Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master2Start.setUTCDate(master2Start.getUTCDate() - 45); // 45일 전 시작
  const master2End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master2End.setUTCDate(master2End.getUTCDate() + 75); // 75일 후 종료

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
    depositStatus: DepositStatus.RECEIVED,
    startDate: master2Start,
    endDate: master2End,
    manufacturerId: 'factory-4',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: Priority.HIGH,
    progress: 30,
    scheduleId: 'schedule-2',
    productType: ProductType.HAIR_CARE,
    serviceType: ServiceType.OEM,
    depositPaid: true,
    managerId: pmUsers[0].id,
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 50 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // SUB 프로젝트들 - MASTER 1의 자식들
  // SUB 1-1: 프리미엄 에센스 (진행중)
  const sub1_1Start = new Date(Date.UTC(master1Start.getUTCFullYear(), master1Start.getUTCMonth(), master1Start.getUTCDate()));
  sub1_1Start.setUTCDate(sub1_1Start.getUTCDate() + 10);
  const sub1_1End = new Date(Date.UTC(master1End.getUTCFullYear(), master1End.getUTCMonth(), master1End.getUTCDate()));
  sub1_1End.setUTCDate(sub1_1End.getUTCDate() - 10);

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
    depositStatus: DepositStatus.RECEIVED,
    startDate: sub1_1Start,
    endDate: sub1_1End,
    manufacturerId: 'factory-1',
    containerId: null,
    packagingId: null,
    priority: Priority.HIGH,
    progress: 60,
    scheduleId: 'schedule-3',
    productType: ProductType.SKINCARE,
    serviceType: ServiceType.ODM,
    depositPaid: true,
    managerId: pmUsers[0].id,
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // SUB 1-2: 프리미엄 크림 (시작전)
  const sub1_2Start = new Date(Date.UTC(master1Start.getUTCFullYear(), master1Start.getUTCMonth(), master1Start.getUTCDate()));
  sub1_2Start.setUTCDate(sub1_2Start.getUTCDate() + 30);
  const sub1_2End = new Date(Date.UTC(master1End.getUTCFullYear(), master1End.getUTCMonth(), master1End.getUTCDate()));
  sub1_2End.setUTCDate(sub1_2End.getUTCDate() - 5);

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
    depositStatus: DepositStatus.PENDING,
    startDate: sub1_2Start,
    endDate: sub1_2End,
    manufacturerId: 'factory-1',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: Priority.MEDIUM,
    progress: 0,
    scheduleId: 'schedule-4',
    productType: ProductType.SKINCARE,
    serviceType: ServiceType.ODM,
    depositPaid: false,
    managerId: pmUsers[0].id,
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // SUB 프로젝트들 - MASTER 2의 자식들
  // SUB 2-1: 천연 샴푸 (진행중)
  const sub2_1Start = new Date(Date.UTC(master2Start.getUTCFullYear(), master2Start.getUTCMonth(), master2Start.getUTCDate()));
  sub2_1Start.setUTCDate(sub2_1Start.getUTCDate() + 5);
  const sub2_1End = new Date(Date.UTC(master2End.getUTCFullYear(), master2End.getUTCMonth(), master2End.getUTCDate()));
  sub2_1End.setUTCDate(sub2_1End.getUTCDate() - 20);

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
    depositStatus: DepositStatus.RECEIVED,
    startDate: sub2_1Start,
    endDate: sub2_1End,
    manufacturerId: 'factory-4',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: Priority.HIGH,
    progress: 40,
    scheduleId: 'schedule-5',
    productType: ProductType.HAIR_CARE,
    serviceType: ServiceType.OEM,
    depositPaid: true,
    managerId: pmUsers[0].id,
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 40 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // 독립적인 SUB 프로젝트들 (parentId 없음)
  // 독립 SUB 1: 선크림 (진행중)
  const indSub1Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub1Start.setUTCDate(indSub1Start.getUTCDate() - 60);
  const indSub1End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub1End.setUTCDate(indSub1End.getUTCDate() + 20);

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
    depositStatus: DepositStatus.RECEIVED,
    startDate: indSub1Start,
    endDate: indSub1End,
    manufacturerId: 'factory-1',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: Priority.HIGH,
    progress: 75,
    scheduleId: 'schedule-6',
    productType: ProductType.SKINCARE,
    serviceType: ServiceType.OEM,
    depositPaid: true,
    managerId: pmUsers[1].id,
    createdBy: pmUsers[1].id,
    createdAt: new Date(currentDate.getTime() - 65 * 24 * 60 * 60 * 1000),
    updatedAt: currentDate,
  });

  // 독립 SUB 2: 클렌징 폼 (완료)
  const indSub2Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub2Start.setUTCDate(indSub2Start.getUTCDate() - 90);
  const indSub2End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub2End.setUTCDate(indSub2End.getUTCDate() - 5);

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
    depositStatus: DepositStatus.RECEIVED,
    startDate: indSub2Start,
    endDate: indSub2End,
    manufacturerId: 'factory-4',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: Priority.MEDIUM,
    progress: 100,
    scheduleId: 'schedule-7',
    productType: ProductType.SKINCARE,
    serviceType: ServiceType.ODM,
    depositPaid: true,
    managerId: pmUsers[1].id,
    createdBy: pmUsers[1].id,
    createdAt: new Date(currentDate.getTime() - 95 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000),
  });

  // 독립 SUB 3: 미스트 (중단)
  const indSub3Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub3Start.setUTCDate(indSub3Start.getUTCDate() - 40);
  const indSub3End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub3End.setUTCDate(indSub3End.getUTCDate() + 50);

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
    depositStatus: DepositStatus.PENDING,
    startDate: indSub3Start,
    endDate: indSub3End,
    manufacturerId: 'factory-1',
    containerId: 'factory-2',
    packagingId: 'factory-3',
    priority: Priority.LOW,
    progress: 20,
    scheduleId: 'schedule-8',
    productType: ProductType.SKINCARE,
    serviceType: ServiceType.OEM,
    depositPaid: false,
    managerId: pmUsers[0].id,
    createdBy: pmUsers[0].id,
    createdAt: new Date(currentDate.getTime() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000),
  });


  return { masterProjects, subProjects };
}