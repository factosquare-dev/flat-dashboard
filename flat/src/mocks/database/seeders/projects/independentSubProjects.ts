import { Project, ProjectType, ProjectStatus, ServiceType, Priority, DepositStatus } from '@/types/project';
import { ProductType } from '@/types/enums';
import { Customer } from '@/types/customer';
import { User } from '@/types/user';
import { enrichProjectWithFactoryNames } from './projectHelpers';

// 독립적인 Sub 프로젝트들 (parentId 없음)
export function createIndependentSubProjects(
  customers: Customer[],
  pmUsers: User[],
  currentDate: Date
): Project[] {
  const subProjects: Project[] = [];

  // 독립 SUB 1: 선크림 (진행중)
  const indSub1Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub1Start.setUTCDate(indSub1Start.getUTCDate() - 60);
  const indSub1End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub1End.setUTCDate(indSub1End.getUTCDate() + 20);

  subProjects.push(enrichProjectWithFactoryNames({
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
    manufacturerId: 'mfg-1',
    containerId: 'cont-1',
    packagingId: 'pack-1',
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
  }));

  // 독립 SUB 2: 클렌징 폼 (완료)
  const indSub2Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub2Start.setUTCDate(indSub2Start.getUTCDate() - 90);
  const indSub2End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub2End.setUTCDate(indSub2End.getUTCDate() - 5);

  subProjects.push(enrichProjectWithFactoryNames({
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
    manufacturerId: 'mfg-2',
    containerId: 'cont-1',
    packagingId: 'pack-1',
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
  }));

  // 독립 SUB 3: 미스트 (중단)
  const indSub3Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub3Start.setUTCDate(indSub3Start.getUTCDate() - 40);
  const indSub3End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  indSub3End.setUTCDate(indSub3End.getUTCDate() + 50);

  subProjects.push(enrichProjectWithFactoryNames({
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
    manufacturerId: 'mfg-1',
    containerId: 'cont-1',
    packagingId: 'pack-1',
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
  }));

  return subProjects;
}