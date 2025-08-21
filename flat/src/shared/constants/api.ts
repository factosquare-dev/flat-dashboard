/**
 * API endpoint constants
 */

const API_BASE = '/api/v1';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    ME: `${API_BASE}/auth/me`,
  },

  // Users
  USERS: {
    BASE: `${API_BASE}/users`,
    BY_ID: (id: string) => `${API_BASE}/users/${id}`,
    PROFILE: `${API_BASE}/users/profile`,
  },

  // Projects
  PROJECTS: {
    BASE: `${API_BASE}/projects`,
    BY_ID: (id: string) => `${API_BASE}/projects/${id}`,
    TASKS: (id: string) => `${API_BASE}/projects/${id}/tasks`,
    SCHEDULE: (id: string) => `${API_BASE}/projects/${id}/schedule`,
  },

  // Factories
  FACTORIES: {
    BASE: `${API_BASE}/factories`,
    BY_ID: (id: string) => `${API_BASE}/factories/${id}`,
    BY_TYPE: (type: string) => `${API_BASE}/factories/type/${type}`,
  },

  // Customers
  CUSTOMERS: {
    BASE: `${API_BASE}/customers`,
    BY_ID: (id: string) => `${API_BASE}/customers/${id}`,
    CONTACTS: (id: string) => `${API_BASE}/customers/${id}/contacts`,
  },

  // Schedules
  SCHEDULES: {
    BASE: `${API_BASE}/schedules`,
    BY_ID: (id: string) => `${API_BASE}/schedules/${id}`,
    TASKS: (id: string) => `${API_BASE}/schedules/${id}/tasks`,
  },

  // Tasks
  TASKS: {
    BASE: `${API_BASE}/tasks`,
    BY_ID: (id: string) => `${API_BASE}/tasks/${id}`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/tasks/${id}/status`,
  },

  // Products
  PRODUCTS: {
    BASE: `${API_BASE}/products`,
    BY_ID: (id: string) => `${API_BASE}/products/${id}`,
    CATEGORIES: `${API_BASE}/products/categories`,
  },

  // Comments
  COMMENTS: {
    BASE: `${API_BASE}/comments`,
    BY_ID: (id: string) => `${API_BASE}/comments/${id}`,
    BY_PROJECT: (projectId: string) => `${API_BASE}/projects/${projectId}/comments`,
  },
} as const;