import { z } from 'zod';
import { APP_CONSTANTS } from '@/config/constants';
import { TaskStatus, ProjectStatus, Priority, UserRole } from '@/types/enums';

// Base validation schemas
export const emailSchema = z
  .string()
  .min(1, APP_CONSTANTS.TEXT.VALIDATION.REQUIRED)
  .email(APP_CONSTANTS.TEXT.VALIDATION.INVALID_EMAIL);

export const phoneSchema = z
  .string()
  .min(1, APP_CONSTANTS.TEXT.VALIDATION.REQUIRED)
  .regex(APP_CONSTANTS.VALIDATION.PHONE_REGEX, APP_CONSTANTS.TEXT.VALIDATION.INVALID_PHONE);

export const requiredStringSchema = z
  .string()
  .min(1, APP_CONSTANTS.TEXT.VALIDATION.REQUIRED);

export const optionalStringSchema = z.string().optional();

// Customer validation schema
export const customerSchema = z.object({
  name: requiredStringSchema,
  companyName: optionalStringSchema,
  contactPerson: optionalStringSchema,
  contactNumber: phoneSchema.optional().or(z.literal('')),
  email: emailSchema.optional().or(z.literal('')),
  address: optionalStringSchema,
  businessNumber: optionalStringSchema,
  industry: optionalStringSchema,
  notes: optionalStringSchema,
});

// Task validation schema
export const taskSchema = z.object({
  name: requiredStringSchema,
  description: optionalStringSchema,
  startDate: z.string().min(1, APP_CONSTANTS.TEXT.VALIDATION.REQUIRED),
  endDate: z.string().min(1, APP_CONSTANTS.TEXT.VALIDATION.REQUIRED),
  status: z.enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.DELAYED, TaskStatus.CANCELLED]),
  priority: z.enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH]).optional(),
  assignee: optionalStringSchema,
  factory: optionalStringSchema,
  projectId: requiredStringSchema,
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: '종료일은 시작일보다 늦어야 합니다',
    path: ['endDate'],
  }
);

// Project validation schema
export const projectSchema = z.object({
  name: requiredStringSchema,
  description: optionalStringSchema,
  startDate: z.string().min(1, APP_CONSTANTS.TEXT.VALIDATION.REQUIRED),
  endDate: z.string().min(1, APP_CONSTANTS.TEXT.VALIDATION.REQUIRED),
  status: z.enum([ProjectStatus.PLANNING, ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED]),
  customerId: requiredStringSchema,
  budget: z.number().min(0, '예산은 0 이상이어야 합니다').optional(),
  progress: z.number().min(0).max(100, '진행률은 0-100% 사이여야 합니다').optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: '종료일은 시작일보다 늦어야 합니다',
    path: ['endDate'],
  }
);

// User validation schema
export const userSchema = z.object({
  name: requiredStringSchema,
  email: emailSchema,
  role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST]),
  phone: phoneSchema.optional().or(z.literal('')),
  department: optionalStringSchema,
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH, `비밀번호는 최소 ${APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다`),
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string().min(1, '검색어를 입력해주세요'),
  filters: z.object({
    status: z.string().optional(),
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
    category: z.string().optional(),
  }).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1, '페이지는 1 이상이어야 합니다'),
  limit: z.number().min(1).max(100, '한 페이지당 최대 100개까지 조회 가능합니다'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Type exports
export type CustomerFormData = z.infer<typeof customerSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;

// Validation utility functions
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: Record<string, string> 
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: '유효성 검사 중 오류가 발생했습니다' } };
  }
};

// Safe parse utility
export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  return schema.safeParse(data);
};