/**
 * Common/General purpose enums
 */

// HTTP Methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

// Common State
export enum CommonState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  EMPTY = 'empty',
  PARTIAL = 'partial',
  COMPLETE = 'complete',
}

// API Response Status
export enum ApiStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

// Sort Direction
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

// Filter Operator
export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IN = 'in',
  NOT_IN = 'not_in',
}

// Editable Cell Types (for tables)
export enum EditableCellType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  BOOLEAN = 'boolean',
}

// Workflow Action Types
export enum WorkflowActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
  COMPLETE = 'complete',
  CANCEL = 'cancel',
  REOPEN = 'reopen',
  ARCHIVE = 'archive',
}

// Drag Item Types
export enum DragItemType {
  TASK = 'task',
  PROJECT = 'project',
  FACTORY = 'factory',
  USER = 'user',
  FILE = 'file',
}

// Special Row Types (for grids/tables)
export enum SpecialRowType {
  TODAY = 'today',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
  MILESTONE = 'milestone',
}

// File Types
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

// File Type Extensions
export const FileTypeExtensions: Record<FileType, string[]> = {
  [FileType.IMAGE]: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
  [FileType.DOCUMENT]: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
  [FileType.SPREADSHEET]: ['xls', 'xlsx', 'csv', 'ods'],
  [FileType.PRESENTATION]: ['ppt', 'pptx', 'odp'],
  [FileType.VIDEO]: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  [FileType.AUDIO]: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
  [FileType.ARCHIVE]: ['zip', 'rar', '7z', 'tar', 'gz'],
  [FileType.OTHER]: [],
};

// Notification Type
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TASK = 'task',
  PROJECT = 'project',
  SYSTEM = 'system',
}

// Notification Priority
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}