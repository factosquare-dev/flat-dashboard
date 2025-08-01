import type { Task, TaskStatus, TaskPriority, TaskType } from '../../types/task';
import type { ApiResponse } from '../../types/api';
import { 
  toTaskId, 
  toTaskIdSafe, 
  toProjectId, 
  toUserId, 
  toUserIdSafe 
} from '@/types/branded';

// API Response interfaces
interface ApiTask {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  project_id: string;
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  progress?: number;
  attachments?: ApiAttachment[];
  checklist?: ApiChecklistItem[];
}

interface ApiAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

interface ApiChecklistItem {
  id: string;
  text: string;
  is_completed: boolean;
  completed_at?: string;
}

/**
 * Transform API task response to domain model with branded types
 */
export function transformApiTask(apiTask: ApiTask): Task {
  return {
    id: toTaskId(apiTask.id),
    title: apiTask.title,
    description: apiTask.description,
    type: apiTask.type as TaskType,
    status: apiTask.status as TaskStatus,
    priority: apiTask.priority as TaskPriority,
    projectId: toProjectId(apiTask.project_id),
    assignedTo: apiTask.assigned_to ? toUserIdSafe(apiTask.assigned_to) : undefined,
    createdBy: toUserId(apiTask.created_by),
    dueDate: apiTask.due_date ? new Date(apiTask.due_date) : undefined,
    completedAt: apiTask.completed_at ? new Date(apiTask.completed_at) : undefined,
    createdAt: new Date(apiTask.created_at),
    updatedAt: new Date(apiTask.updated_at),
    tags: apiTask.tags ?? [],
    estimatedHours: apiTask.estimated_hours,
    actualHours: apiTask.actual_hours,
    progress: apiTask.progress ?? 0,
    attachments: apiTask.attachments?.map(transformApiAttachment) ?? [],
    checklist: apiTask.checklist?.map(transformApiChecklistItem) ?? []
  };
}

/**
 * Transform API attachment to domain model
 */
function transformApiAttachment(apiAttachment: ApiAttachment) {
  return {
    id: apiAttachment.id,
    name: apiAttachment.name,
    url: apiAttachment.url,
    size: apiAttachment.size,
    mimeType: apiAttachment.mime_type,
    uploadedAt: new Date(apiAttachment.uploaded_at)
  };
}

/**
 * Transform API checklist item to domain model
 */
function transformApiChecklistItem(apiItem: ApiChecklistItem) {
  return {
    id: apiItem.id,
    text: apiItem.text,
    isCompleted: apiItem.is_completed,
    completedAt: apiItem.completed_at ? new Date(apiItem.completed_at) : undefined
  };
}

/**
 * Transform domain model to API request format
 */
export function transformTaskToApi(task: Partial<Task>): Partial<ApiTask> {
  const apiTask: Partial<ApiTask> = {};
  
  if (task.id) apiTask.id = task.id;
  if (task.title) apiTask.title = task.title;
  if (task.description !== undefined) apiTask.description = task.description;
  if (task.type) apiTask.type = task.type;
  if (task.status) apiTask.status = task.status;
  if (task.priority) apiTask.priority = task.priority;
  if (task.projectId) apiTask.project_id = task.projectId;
  if (task.assignedTo !== undefined) apiTask.assigned_to = task.assignedTo;
  if (task.dueDate) apiTask.due_date = task.dueDate.toISOString();
  if (task.tags) apiTask.tags = task.tags;
  if (task.estimatedHours !== undefined) apiTask.estimated_hours = task.estimatedHours;
  if (task.actualHours !== undefined) apiTask.actual_hours = task.actualHours;
  if (task.progress !== undefined) apiTask.progress = task.progress;
  
  return apiTask;
}

/**
 * Transform paginated API response
 */
export function transformApiTaskList(response: ApiResponse<ApiTask[]>): ApiResponse<Task[]> {
  if (!response.success || !response.data) {
    return response as ApiResponse<Task[]>;
  }
  
  return {
    ...response,
    data: response.data.map(transformApiTask)
  };
}

/**
 * Validate and transform task ID from API
 */
export function validateApiTaskId(id: unknown): string {
  if (typeof id !== 'string') {
    throw new Error(`Invalid task ID type: ${typeof id}`);
  }
  
  const taskId = toTaskIdSafe(id);
  if (!taskId) {
    throw new Error(`Invalid task ID format: ${id}`);
  }
  
  return taskId;
}