// Project Status Enums
export enum ProjectStatusEnum {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProjectStatusDisplayEnum {
  PLANNING = '시작전',
  IN_PROGRESS = '진행중',
  COMPLETED = '완료',
  CANCELLED = '중단'
}

// Task Status Enums
export enum TaskStatusEnum {
  PLANNING = 'planning',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskStatusDisplayEnum {
  PLANNING = '시작전',
  IN_PROGRESS = '진행중',
  COMPLETED = '완료',
  CANCELLED = '중단'
}

// Service Type Enums
export enum ServiceTypeEnum {
  OEM = 'OEM',
  ODM = 'ODM',
  OBM = 'OBM'
}

// Priority Enums
export enum PriorityEnum {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum PriorityDisplayEnum {
  HIGH = '높음',
  MEDIUM = '보통',
  LOW = '낮음'
}

// Project Type Enums
export enum ProjectTypeEnum {
  MASTER = 'MASTER',
  SUB = 'SUB',
  TASK = 'TASK'
}

export enum ProjectTypeDisplayEnum {
  MASTER = '대형',
  SUB = '소형',
  TASK = '작업'
}


// Status mapping functions using enums
export const mapProjectStatus = (status: string): string => {
  return ProjectStatusDisplayEnum[status as keyof typeof ProjectStatusDisplayEnum] || status;
};

export const mapTaskStatus = (status: string): string => {
  const upperStatus = status.toUpperCase().replace('-', '_');
  return TaskStatusDisplayEnum[upperStatus as keyof typeof TaskStatusDisplayEnum] || status;
};

export const mapPriority = (priority: string): string => {
  const upperPriority = priority.toUpperCase();
  return PriorityDisplayEnum[upperPriority as keyof typeof PriorityDisplayEnum] || priority;
};

export const mapProjectType = (type: string): string => {
  return ProjectTypeDisplayEnum[type as keyof typeof ProjectTypeDisplayEnum] || type;
};