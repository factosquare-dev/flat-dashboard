/**
 * Project related enums and constants
 */

// Project Status
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Project Status Labels (Korean)
export const ProjectStatusLabel: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: '시작전',
  [ProjectStatus.IN_PROGRESS]: '진행중',
  [ProjectStatus.ON_HOLD]: '보류',
  [ProjectStatus.COMPLETED]: '완료',
  [ProjectStatus.CANCELLED]: '중단',
};

// Project Type
export enum ProjectType {
  MASTER = 'MASTER',
  SUB = 'SUB',
  TASK = 'TASK',
}

// Project Type Labels (Korean)
export const ProjectTypeLabel: Record<ProjectType, string> = {
  [ProjectType.MASTER]: '대형',
  [ProjectType.SUB]: '소형',
  [ProjectType.TASK]: '작업',
};

// Priority
export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Priority Labels (Korean)
export const PriorityLabel: Record<Priority, string> = {
  [Priority.HIGH]: '높음',
  [Priority.MEDIUM]: '보통',
  [Priority.LOW]: '낮음',
};

// Service Types
export enum ServiceType {
  OEM = 'OEM',
  ODM = 'ODM',
  OBM = 'OBM',
  PRIVATE_LABEL = 'PRIVATE_LABEL',
  WHITE_LABEL = 'WHITE_LABEL',
  CO_PACKING = 'CO_PACKING',
  CONTRACT_MANUFACTURING = 'CONTRACT_MANUFACTURING',
  CUSTOM_MANUFACTURING = 'CUSTOM_MANUFACTURING',
  OTHER = 'OTHER',
}

// Service Type Labels (Korean)
export const ServiceTypeLabel: Record<ServiceType, string> = {
  [ServiceType.OEM]: 'OEM',
  [ServiceType.ODM]: 'ODM',
  [ServiceType.OBM]: 'OBM',
  [ServiceType.PRIVATE_LABEL]: 'Private Label',
  [ServiceType.WHITE_LABEL]: 'White Label',
  [ServiceType.CO_PACKING]: 'Co-Packing',
  [ServiceType.CONTRACT_MANUFACTURING]: 'Contract Manufacturing',
  [ServiceType.CUSTOM_MANUFACTURING]: 'Custom Manufacturing',
  [ServiceType.OTHER]: '기타',
};

// Deposit Status
export enum DepositStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

// Deposit Status Labels (Korean)
export const DepositStatusLabel: Record<DepositStatus, string> = {
  [DepositStatus.PENDING]: '대기중',
  [DepositStatus.PAID]: '지불완료',
  [DepositStatus.REFUNDED]: '환불완료',
};

// Project Field
export enum ProjectField {
  ID = 'id',
  NAME = 'name',
  PRODUCT_NAME = 'productName',
  STATUS = 'status',
  TYPE = 'type',
  SERVICE_TYPE = 'serviceType',
  PRIORITY = 'priority',
  SALES = 'sales',
  PURCHASE = 'purchase',
  DEPOSIT = 'deposit',
  DEPOSIT_PAID = 'depositPaid',
  MANAGER = 'manager',
  MANAGER_ID = 'managerId',
  CUSTOMER = 'customer',
  CUSTOMER_ID = 'customerId',
  MANUFACTURER = 'manufacturer',
  MANUFACTURER_ID = 'manufacturerId',
  CONTAINER = 'container',
  CONTAINER_ID = 'containerId',
  PACKAGING = 'packaging',
  PACKAGING_ID = 'packagingId',
  PROGRESS = 'progress',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ORDER_DATE = 'orderDate',
  DELIVERY_DATE = 'deliveryDate',
  PARENT_ID = 'parentId',
  SUB_PROJECT_COUNT = 'subProjectCount',
  TASK_COUNT = 'taskCount',
}

// Project Field Labels (Korean)
export const ProjectFieldLabel: Record<ProjectField, string> = {
  [ProjectField.ID]: 'ID',
  [ProjectField.NAME]: '프로젝트명',
  [ProjectField.PRODUCT_NAME]: '제품명',
  [ProjectField.STATUS]: '상태',
  [ProjectField.TYPE]: '유형',
  [ProjectField.SERVICE_TYPE]: '서비스 유형',
  [ProjectField.PRIORITY]: '우선순위',
  [ProjectField.SALES]: '매출',
  [ProjectField.PURCHASE]: '매입',
  [ProjectField.DEPOSIT]: '계약금',
  [ProjectField.DEPOSIT_PAID]: '계약금 지불',
  [ProjectField.MANAGER]: '담당자',
  [ProjectField.MANAGER_ID]: '담당자 ID',
  [ProjectField.CUSTOMER]: '고객사',
  [ProjectField.CUSTOMER_ID]: '고객사 ID',
  [ProjectField.MANUFACTURER]: '제조 공장',
  [ProjectField.MANUFACTURER_ID]: '제조 공장 ID',
  [ProjectField.CONTAINER]: '용기 공장',
  [ProjectField.CONTAINER_ID]: '용기 공장 ID',
  [ProjectField.PACKAGING]: '포장 공장',
  [ProjectField.PACKAGING_ID]: '포장 공장 ID',
  [ProjectField.PROGRESS]: '진행률',
  [ProjectField.START_DATE]: '시작일',
  [ProjectField.END_DATE]: '종료일',
  [ProjectField.CREATED_AT]: '생성일',
  [ProjectField.UPDATED_AT]: '수정일',
  [ProjectField.ORDER_DATE]: '주문일',
  [ProjectField.DELIVERY_DATE]: '배송일',
  [ProjectField.PARENT_ID]: '상위 프로젝트 ID',
  [ProjectField.SUB_PROJECT_COUNT]: '하위 프로젝트 수',
  [ProjectField.TASK_COUNT]: '작업 수',
};