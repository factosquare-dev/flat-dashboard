/**
 * API Interceptor
 * Routes API requests to mock API when enabled
 */

import { mockApi } from './MockApi';
import { ApiResponse } from '@/services/api';

// Configuration
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.DEV;
const MOCK_API_DELAY = Number(import.meta.env.VITE_MOCK_API_DELAY) || 200;

/**
 * Map real API endpoints to mock API methods
 */
const endpointMappings: Record<string, (params: any) => Promise<any>> = {
  // User endpoints
  'GET /api/users': () => mockApi.users.getAll(),
  'GET /api/users/:id': (params) => mockApi.users.getById(params.id),
  'POST /api/users': (params) => mockApi.users.create(params.body),
  'PUT /api/users/:id': (params) => mockApi.users.update(params.id, params.body),
  'DELETE /api/users/:id': (params) => mockApi.users.delete(params.id),
  'POST /api/auth/login': (params) => mockApi.users.login(params.body.username, params.body.password),
  
  // Factory endpoints
  'GET /api/factories': () => mockApi.factories.getAll(),
  'GET /api/factories/:id': (params) => mockApi.factories.getById(params.id),
  'POST /api/factories': (params) => mockApi.factories.create(params.body),
  'PUT /api/factories/:id': (params) => mockApi.factories.update(params.id, params.body),
  'DELETE /api/factories/:id': (params) => mockApi.factories.delete(params.id),
  'GET /api/factories/type/:type': (params) => mockApi.factories.getByType(params.type),
  'GET /api/factories/:id/availability': (params) => 
    mockApi.factories.checkAvailability(params.id, params.query.startDate, params.query.endDate),
  
  // Project endpoints
  'GET /api/projects': (params) => mockApi.projects.getAll(params.query),
  'GET /api/projects/:id': (params) => mockApi.projects.getById(params.id),
  'POST /api/projects': (params) => mockApi.projects.create(params.body),
  'PUT /api/projects/:id': (params) => mockApi.projects.update(params.id, params.body),
  'DELETE /api/projects/:id': (params) => mockApi.projects.delete(params.id),
  'PATCH /api/projects/:id/status': (params) => mockApi.projects.updateStatus(params.id, params.body.status),
  'PATCH /api/projects/:id/progress': (params) => mockApi.projects.updateProgress(params.id, params.body.progress),
  'POST /api/projects/:id/comments': (params) => 
    mockApi.projects.addComment(params.id, params.body.userId, params.body.content),
  'POST /api/projects/:id/users': (params) => 
    mockApi.projects.assignUser(params.id, params.body.userId, params.body.role),
  'DELETE /api/projects/:id/users/:userId': (params) => 
    mockApi.projects.removeUser(params.id, params.userId),
  
  // Database management endpoints
  'GET /api/admin/database/stats': () => mockApi.database.getStats(),
  'GET /api/admin/database/export': () => mockApi.database.export(),
  'POST /api/admin/database/import': (params) => mockApi.database.import(params.body.data),
  'POST /api/admin/database/reset': () => mockApi.database.reset(),
};

/**
 * Parse endpoint pattern with parameters
 */
function parseEndpoint(method: string, url: string): { pattern: string; params: Record<string, string> } {
  const [pathname, search] = url.split('?');
  const segments = pathname.split('/').filter(Boolean);
  const params: Record<string, string> = {};
  
  // Parse query parameters
  if (search) {
    const searchParams = new URLSearchParams(search);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }
  
  // Find matching pattern
  for (const [pattern, handler] of Object.entries(endpointMappings)) {
    const [patternMethod, patternPath] = pattern.split(' ');
    
    if (patternMethod !== method) continue;
    
    const patternSegments = patternPath.split('/').filter(Boolean);
    
    if (segments.length !== patternSegments.length) continue;
    
    let match = true;
    const extractedParams: Record<string, string> = {};
    
    for (let i = 0; i < segments.length; i++) {
      if (patternSegments[i].startsWith(':')) {
        // Parameter segment
        const paramName = patternSegments[i].substring(1);
        extractedParams[paramName] = segments[i];
      } else if (segments[i] !== patternSegments[i]) {
        // Mismatch
        match = false;
        break;
      }
    }
    
    if (match) {
      return {
        pattern,
        params: { ...extractedParams, query: params },
      };
    }
  }
  
  return { pattern: '', params: {} };
}

/**
 * Intercept API request and route to mock if enabled
 */
export async function interceptApiRequest<T = any>(
  method: string,
  url: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, any>;
  }
): Promise<ApiResponse<T>> {
  if (!USE_MOCK_API) {
    // Return null to indicate that the real API should be used
    return null as any;
  }
  
  try {
    // Add delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    
    // Parse endpoint and extract parameters
    const { pattern, params } = parseEndpoint(method, url);
    
    if (!pattern || !endpointMappings[pattern]) {
      return null as any;
    }
    
    // Call mock handler
    const handler = endpointMappings[pattern];
    const requestParams = {
      ...params,
      body: options?.body,
      headers: options?.headers,
      ...options?.params,
    };
    
    const result = await handler(requestParams);
    
    // Format as ApiResponse
    return {
      data: result.data,
      status: result.success ? 200 : 400,
      statusText: result.success ? 'OK' : 'Bad Request',
      headers: {},
      config: {} as any,
    };
  } catch (error) {
    console.error('Mock API error:', error);
    
    // Format error as ApiResponse
    return {
      data: null as any,
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as any,
      error: error instanceof Error ? error : new Error('Mock API error'),
    } as any;
  }
}

/**
 * Check if mock API is enabled
 */
export function isMockApiEnabled(): boolean {
  return USE_MOCK_API;
}

/**
 * Enable/disable mock API at runtime
 */
export function setMockApiEnabled(enabled: boolean): void {
  (window as any).__USE_MOCK_API__ = enabled;
}