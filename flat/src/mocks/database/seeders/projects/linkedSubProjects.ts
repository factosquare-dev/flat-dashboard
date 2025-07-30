import { Project, ProjectType, ProjectStatus, ServiceType, Priority, DepositStatus } from '@/types/project';
import { ProductType } from '@/types/enums';
import { Customer } from '@/types/customer';
import { User } from '@/types/user';
import { enrichProjectWithFactoryNames } from './projectHelpers';

// Master 프로젝트와 연결된 Sub 프로젝트들
export function createLinkedSubProjects(
  customers: Customer[],
  pmUsers: User[],
  currentDate: Date,
  master1Start: Date,
  master1End: Date,
  master2Start: Date,
  master2End: Date
): Project[] {
  const subProjects: Project[] = [];

  // SUB 프로젝트들 - MASTER 1의 자식들
  // SUB 1-1: 프리미엄 에센스 (진행중)
  const sub1_1Start = new Date(Date.UTC(master1Start.getUTCFullYear(), master1Start.getUTCMonth(), master1Start.getUTCDate()));
  sub1_1Start.setUTCDate(sub1_1Start.getUTCDate() + 10);
  const sub1_1End = new Date(Date.UTC(master1End.getUTCFullYear(), master1End.getUTCMonth(), master1End.getUTCDate()));
  sub1_1End.setUTCDate(sub1_1End.getUTCDate() - 10);

  subProjects.push(enrichProjectWithFactoryNames({
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
    manufacturerId: 'mfg-1',
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
  }));

  // SUB 1-2: 프리미엄 크림 (시작전)
  const sub1_2Start = new Date(Date.UTC(master1Start.getUTCFullYear(), master1Start.getUTCMonth(), master1Start.getUTCDate()));
  sub1_2Start.setUTCDate(sub1_2Start.getUTCDate() + 30);
  const sub1_2End = new Date(Date.UTC(master1End.getUTCFullYear(), master1End.getUTCMonth(), master1End.getUTCDate()));
  sub1_2End.setUTCDate(sub1_2End.getUTCDate() - 5);

  subProjects.push(enrichProjectWithFactoryNames({
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
    manufacturerId: 'mfg-1',
    containerId: 'cont-1',
    packagingId: 'pack-1',
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
  }));

  // SUB 프로젝트들 - MASTER 2의 자식들
  // SUB 2-1: 천연 샴푸 (진행중)
  const sub2_1Start = new Date(Date.UTC(master2Start.getUTCFullYear(), master2Start.getUTCMonth(), master2Start.getUTCDate()));
  sub2_1Start.setUTCDate(sub2_1Start.getUTCDate() + 5);
  const sub2_1End = new Date(Date.UTC(master2End.getUTCFullYear(), master2End.getUTCMonth(), master2End.getUTCDate()));
  sub2_1End.setUTCDate(sub2_1End.getUTCDate() - 20);

  subProjects.push(enrichProjectWithFactoryNames({
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
    manufacturerId: 'mfg-2',
    containerId: 'cont-1',
    packagingId: 'pack-1',
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
  }));

  return subProjects;
}