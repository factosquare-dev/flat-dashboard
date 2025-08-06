/**
 * Task and Schedule related enums and constants
 */

// Task Status
export enum TaskStatus {
  TODO = 'todo',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Task Status Labels (Korean)
export const TaskStatusLabel: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: '대기',
  [TaskStatus.PENDING]: '보류',
  [TaskStatus.IN_PROGRESS]: '진행중',
  [TaskStatus.COMPLETED]: '완료',
  [TaskStatus.CANCELLED]: '중단',
};

// Task Type - Organized by factory type relevance
export enum TaskType {
  // Common Tasks (모든 공장 타입 공통)
  DESIGN = 'design',
  PROTOTYPING = 'prototyping',
  SAMPLE = 'sample',
  QUALITY_CHECK = 'quality_check',
  INSPECTION = 'inspection',
  TESTING = 'testing',
  APPROVAL = 'approval',
  MEETING = 'meeting',
  DOCUMENTATION = 'documentation',
  
  // Manufacturing Tasks (제조 공장)
  SOURCING = 'sourcing',
  MATERIAL = 'material',
  MATERIAL_PREPARATION = 'material_preparation',
  PREPARATION = 'preparation',
  PRODUCTION = 'production',
  MANUFACTURING = 'manufacturing',
  MIXING = 'mixing',        // 혼합
  FILLING = 'filling',      // 충전
  ASSEMBLY = 'assembly',
  
  // Container Tasks (용기 공장)
  MOLD_DESIGN = 'mold_design',
  MOLD_MAKING = 'mold_making',
  INJECTION_MOLDING = 'injection_molding',
  BLOW_MOLDING = 'blow_molding',
  TRIMMING = 'trimming',
  
  // Packaging Tasks (포장 공장)
  PACKAGING_DESIGN = 'packaging_design',
  PRINTING_PLATE = 'printing_plate',
  PRINTING = 'printing',
  COLOR_CORRECTION = 'color_correction',
  POST_PROCESSING = 'post_processing',
  LABELING = 'labeling',
  BOXING = 'boxing',
  PACKING = 'packing',
  
  // Logistics (물류)
  PACKAGING = 'packaging',  // 포장 작업
  SHIPPING = 'shipping',
  DELIVERY = 'delivery',
  
  // Others
  OTHER = 'other',
}

// Task Type Labels (Korean)
export const TaskTypeLabel: Record<TaskType, string> = {
  // Common Tasks
  [TaskType.DESIGN]: '디자인',
  [TaskType.PROTOTYPING]: '시제품 제작',
  [TaskType.SAMPLE]: '샘플 제작',
  [TaskType.QUALITY_CHECK]: '품질 검사',
  [TaskType.INSPECTION]: '검수',
  [TaskType.TESTING]: '테스트',
  [TaskType.APPROVAL]: '승인',
  [TaskType.MEETING]: '미팅',
  [TaskType.DOCUMENTATION]: '문서화',
  
  // Manufacturing Tasks
  [TaskType.SOURCING]: '원료 소싱',
  [TaskType.MATERIAL]: '원료 준비',
  [TaskType.MATERIAL_PREPARATION]: '원료 전처리',
  [TaskType.PREPARATION]: '생산 준비',
  [TaskType.PRODUCTION]: '생산',
  [TaskType.MANUFACTURING]: '제조',
  [TaskType.MIXING]: '혼합',
  [TaskType.FILLING]: '충전',
  [TaskType.ASSEMBLY]: '조립',
  
  // Container Tasks
  [TaskType.MOLD_DESIGN]: '금형 설계',
  [TaskType.MOLD_MAKING]: '금형 제작',
  [TaskType.INJECTION_MOLDING]: '사출 성형',
  [TaskType.BLOW_MOLDING]: '블로우 성형',
  [TaskType.TRIMMING]: '트리밍',
  
  // Packaging Tasks
  [TaskType.PACKAGING_DESIGN]: '포장 디자인',
  [TaskType.PRINTING_PLATE]: '인쇄판 제작',
  [TaskType.PRINTING]: '인쇄',
  [TaskType.COLOR_CORRECTION]: '색상 보정',
  [TaskType.POST_PROCESSING]: '후가공',
  [TaskType.LABELING]: '라벨링',
  [TaskType.BOXING]: '박스 포장',
  [TaskType.PACKING]: '패킹',
  
  // Logistics
  [TaskType.PACKAGING]: '포장',
  [TaskType.SHIPPING]: '출하',
  [TaskType.DELIVERY]: '납품',
  
  // Others
  [TaskType.OTHER]: '기타',
};

// Task types by factory type
export const TasksByFactoryType = {
  MANUFACTURING: [
    TaskType.DESIGN,
    TaskType.SOURCING,
    TaskType.MATERIAL,
    TaskType.MATERIAL_PREPARATION,
    TaskType.PREPARATION,
    TaskType.PROTOTYPING,
    TaskType.MIXING,
    TaskType.FILLING,
    TaskType.PRODUCTION,
    TaskType.MANUFACTURING,
    TaskType.ASSEMBLY,
    TaskType.QUALITY_CHECK,
    TaskType.INSPECTION,
    TaskType.APPROVAL,
  ],
  CONTAINER: [
    TaskType.DESIGN,
    TaskType.MOLD_DESIGN,
    TaskType.MOLD_MAKING,
    TaskType.INJECTION_MOLDING,
    TaskType.BLOW_MOLDING,
    TaskType.TRIMMING,
    TaskType.SAMPLE,
    TaskType.QUALITY_CHECK,
    TaskType.INSPECTION,
    TaskType.APPROVAL,
  ],
  PACKAGING: [
    TaskType.PACKAGING_DESIGN,
    TaskType.PRINTING_PLATE,
    TaskType.COLOR_CORRECTION,
    TaskType.PRINTING,
    TaskType.POST_PROCESSING,
    TaskType.LABELING,
    TaskType.BOXING,
    TaskType.PACKING,
    TaskType.QUALITY_CHECK,
    TaskType.INSPECTION,
    TaskType.SHIPPING,
  ],
};

// Participant Role
export enum ParticipantRole {
  MANAGER = 'manager',
  MEMBER = 'member',
  REVIEWER = 'reviewer',
  OBSERVER = 'observer',
}

// Participant Role Labels (Korean)
export const ParticipantRoleLabel: Record<ParticipantRole, string> = {
  [ParticipantRole.MANAGER]: '관리자',
  [ParticipantRole.MEMBER]: '구성원',
  [ParticipantRole.REVIEWER]: '검토자',
  [ParticipantRole.OBSERVER]: '관찰자',
};

// View Mode for Schedule
export enum ViewMode {
  GANTT = 'gantt',
  TABLE = 'table',
  CALENDAR = 'calendar',
  LIST = 'list',
  BOARD = 'board',
  TIMELINE = 'timeline',
}

// View Mode Labels (Korean)
export const ViewModeLabel: Record<ViewMode, string> = {
  [ViewMode.GANTT]: '간트차트',
  [ViewMode.TABLE]: '테이블',
  [ViewMode.CALENDAR]: '캘린더',
  [ViewMode.LIST]: '목록',
  [ViewMode.BOARD]: '보드',
  [ViewMode.TIMELINE]: '타임라인',
};

// Period Type
export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

// Period Type Labels (Korean)
export const PeriodTypeLabel: Record<PeriodType, string> = {
  [PeriodType.DAILY]: '일간',
  [PeriodType.WEEKLY]: '주간',
  [PeriodType.MONTHLY]: '월간',
  [PeriodType.QUARTERLY]: '분기',
  [PeriodType.YEARLY]: '연간',
  [PeriodType.CUSTOM]: '사용자 정의',
};

// Special Row Type (for Gantt chart)
export enum SpecialRowType {
  TODAY = 'today',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
  MILESTONE = 'milestone',
}

// Workflow Action Type
export enum WorkflowActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
  COMPLETE = 'complete',
  CANCEL = 'cancel',
}

// Drag Item Type
export enum DragItemType {
  TASK = 'task',
  PROJECT = 'project',
  FACTORY = 'factory',
  USER = 'user',
}