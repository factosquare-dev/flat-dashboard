import { Project, ProjectType, ProjectStatus, ServiceType, Priority, DepositStatus } from '@/types/project';
import { ProductType } from '@/types/enums';
import { Customer } from '@/types/customer';
import { User } from '@/types/user';
import { enrichProjectWithFactoryNames } from './projectHelpers';

export function createMasterProjects(
  customers: Customer[],
  pmUsers: User[],
  currentDate: Date
): Project[] {
  const masterProjects: Project[] = [];

  // MASTER 프로젝트 1: 프리미엄 화장품 라인
  const master1Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master1Start.setUTCDate(master1Start.getUTCDate() - 30); // 30일 전 시작
  const master1End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master1End.setUTCDate(master1End.getUTCDate() + 60); // 60일 후 종료

  masterProjects.push(enrichProjectWithFactoryNames({
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
    manufacturerId: 'mfg-1',
    containerId: 'cont-1',
    packagingId: 'pack-1',
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
  }));

  // MASTER 프로젝트 2: 천연 화장품 시리즈
  const master2Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master2Start.setUTCDate(master2Start.getUTCDate() - 45); // 45일 전 시작
  const master2End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master2End.setUTCDate(master2End.getUTCDate() + 75); // 75일 후 종료

  masterProjects.push(enrichProjectWithFactoryNames({
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
    manufacturerId: 'mfg-2',
    containerId: 'cont-1',
    packagingId: 'pack-1',
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
  }));

  return masterProjects;
}