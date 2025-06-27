import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:8000/api/v1'

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'admin@flat.com' && body.password === 'Admin123!') {
      return HttpResponse.json({
        access_token: 'mock-admin-token',
        token_type: 'bearer',
        user: {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'admin@flat.com',
          username: 'admin',
          roles: ['ADMIN']
        }
      })
    }
    
    if (body.email === 'customer@test.com' && body.password === 'Customer123!') {
      return HttpResponse.json({
        access_token: 'mock-customer-token',
        token_type: 'bearer',
        user: {
          user_id: '223e4567-e89b-12d3-a456-426614174000',
          email: 'customer@test.com',
          username: 'customer',
          roles: ['CUSTOMER']
        }
      })
    }
    
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  // Permission check endpoint
  http.get(`${API_URL}/permissions/check`, ({ request }) => {
    const url = new URL(request.url)
    const resource = url.searchParams.get('resource')
    const action = url.searchParams.get('action')
    const token = request.headers.get('Authorization')
    
    // Admin has all permissions
    if (token === 'Bearer mock-admin-token') {
      return HttpResponse.json({ allowed: true })
    }
    
    // Customer permissions
    if (token === 'Bearer mock-customer-token') {
      const allowed = 
        (resource === 'PROJECT' && ['READ', 'CREATE', 'UPDATE'].includes(action!)) ||
        (resource === 'ORDER' && ['READ', 'CREATE'].includes(action!))
      
      return HttpResponse.json({ allowed })
    }
    
    return HttpResponse.json({ allowed: false })
  }),

  // Projects endpoint
  http.get(`${API_URL}/projects`, ({ request }) => {
    const token = request.headers.get('Authorization')
    
    if (!token) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      items: [
        {
          project_id: '323e4567-e89b-12d3-a456-426614174000',
          name: 'Test Project 1',
          description: 'Test project description',
          customer_id: '223e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          project_id: '423e4567-e89b-12d3-a456-426614174000',
          name: 'Test Project 2',
          description: 'Another test project',
          customer_id: '223e4567-e89b-12d3-a456-426614174000',
          created_at: '2024-01-02T00:00:00Z'
        }
      ],
      total: 2,
      page: 1,
      size: 10
    })
  }),

  // Single project endpoint
  http.get(`${API_URL}/projects/:projectId`, ({ params, request }) => {
    const token = request.headers.get('Authorization')
    
    if (!token) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Check ownership
    if (token === 'Bearer mock-customer-token' && params.projectId === '523e4567-e89b-12d3-a456-426614174000') {
      return HttpResponse.json(
        { detail: "You don't have access to this resource" },
        { status: 403 }
      )
    }
    
    return HttpResponse.json({
      project_id: params.projectId,
      name: 'Test Project',
      description: 'Test project description',
      customer_id: '223e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-01-01T00:00:00Z'
    })
  }),

  // Create project endpoint
  http.post(`${API_URL}/projects`, async ({ request }) => {
    const token = request.headers.get('Authorization')
    const body = await request.json() as { name: string; description: string }
    
    if (!token) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      project_id: '623e4567-e89b-12d3-a456-426614174000',
      name: body.name,
      description: body.description,
      customer_id: '223e4567-e89b-12d3-a456-426614174000',
      created_at: new Date().toISOString()
    })
  }),

  // Ownership check endpoint
  http.post(`${API_URL}/ownership/check-bulk-ownership`, async ({ request }) => {
    const token = request.headers.get('Authorization')
    const body = await request.json() as { resource_type: string; resource_ids: string[] }
    
    if (!token) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Mock ownership response
    const ownership: Record<string, boolean> = {}
    
    if (token === 'Bearer mock-admin-token') {
      // Admin owns everything
      body.resource_ids.forEach(id => {
        ownership[id] = true
      })
    } else if (token === 'Bearer mock-customer-token') {
      // Customer owns specific resources
      body.resource_ids.forEach(id => {
        ownership[id] = ['323e4567-e89b-12d3-a456-426614174000', '423e4567-e89b-12d3-a456-426614174000'].includes(id)
      })
    }
    
    return HttpResponse.json({ ownership })
  }),

  // Transfer ownership endpoint
  http.post(`${API_URL}/projects/:projectId/transfer`, async ({ params, request }) => {
    const token = request.headers.get('Authorization')
    const body = await request.json() as { new_owner_id: string }
    
    if (!token) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      project_id: params.projectId,
      previous_owner: '223e4567-e89b-12d3-a456-426614174000',
      new_owner: body.new_owner_id,
      status: 'transferred'
    })
  }),

  // Cache invalidation endpoint (for testing)
  http.post(`${API_URL}/cache/invalidate`, async ({ request }) => {
    const token = request.headers.get('Authorization')
    
    if (!token || !token.includes('admin')) {
      return HttpResponse.json(
        { detail: 'Admin access required' },
        { status: 403 }
      )
    }
    
    return HttpResponse.json({ status: 'invalidated' })
  }),
]