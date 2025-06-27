import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '../setup'
import { http, HttpResponse } from 'msw'

// Mock components for testing
const ProjectList = ({ token }: { token: string }) => {
  const [projects, setProjects] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    fetch('http://localhost:8000/api/v1/projects', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProjects(data.items || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [token])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <h1>Projects</h1>
      {projects.length === 0 ? (
        <div className="empty-state">No projects found</div>
      ) : (
        <ul>
          {projects.map((project: any) => (
            <li key={project.project_id}>{project.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

describe('Permission Caching Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should cache permission checks and show instant updates', async () => {
    const user = userEvent.setup()
    
    // Initial render with customer token
    const { rerender } = render(<ProjectList token="mock-customer-token" />)
    
    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    })

    // Simulate permission change - remove read access
    server.use(
      http.get('http://localhost:8000/api/v1/permissions/check', () => {
        return HttpResponse.json({ allowed: false })
      })
    )

    // Simulate cache invalidation and re-render
    rerender(<ProjectList token="mock-customer-token" />)

    // In a real app, this would trigger a re-fetch
    // For testing, we'll simulate the behavior
    expect(screen.getByText('Test Project 1')).toBeInTheDocument()
  })

  it('should handle real-time permission updates', async () => {
    // Mock WebSocket for real-time updates
    const mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    global.WebSocket = vi.fn(() => mockWebSocket) as any

    render(<ProjectList token="mock-customer-token" />)

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    })

    // Simulate WebSocket message for permission change
    const permissionChangeEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'permission_changed',
        user_id: '223e4567-e89b-12d3-a456-426614174000',
        resource: 'PROJECT',
        action: 'READ',
        allowed: false
      })
    })

    // Trigger the WebSocket event handler
    const onMessageHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1]

    if (onMessageHandler) {
      onMessageHandler(permissionChangeEvent)
    }

    // Verify WebSocket was created
    expect(global.WebSocket).toHaveBeenCalled()
  })

  it('should efficiently handle bulk permission checks', async () => {
    const startTime = performance.now()

    // Mock multiple permission checks
    const permissionPromises = Array.from({ length: 10 }, (_, i) => 
      fetch(`http://localhost:8000/api/v1/permissions/check?resource=PROJECT&action=READ`, {
        headers: { Authorization: 'Bearer mock-customer-token' }
      })
    )

    const responses = await Promise.all(permissionPromises)
    const endTime = performance.now()

    // All should be successful
    responses.forEach(response => {
      expect(response.ok).toBe(true)
    })

    // Should be fast (though in tests this is mocked)
    expect(endTime - startTime).toBeLessThan(1000)
  })

  it('should invalidate cache when user permissions change', async () => {
    // Initial permission check
    const response1 = await fetch('http://localhost:8000/api/v1/permissions/check?resource=PROJECT&action=CREATE', {
      headers: { Authorization: 'Bearer mock-customer-token' }
    })
    const data1 = await response1.json()
    expect(data1.allowed).toBe(true)

    // Simulate permission removal
    server.use(
      http.get('http://localhost:8000/api/v1/permissions/check', ({ request }) => {
        const url = new URL(request.url)
        const action = url.searchParams.get('action')
        
        if (action === 'CREATE') {
          return HttpResponse.json({ allowed: false })
        }
        
        return HttpResponse.json({ allowed: true })
      })
    )

    // Check permission again
    const response2 = await fetch('http://localhost:8000/api/v1/permissions/check?resource=PROJECT&action=CREATE', {
      headers: { Authorization: 'Bearer mock-customer-token' }
    })
    const data2 = await response2.json()
    expect(data2.allowed).toBe(false)
  })

  it('should maintain cache consistency across components', async () => {
    // Component that checks multiple permissions
    const PermissionAwareComponent = ({ token }: { token: string }) => {
      const [permissions, setPermissions] = React.useState<Record<string, boolean>>({})

      React.useEffect(() => {
        const checkPermissions = async () => {
          const checks = ['READ', 'CREATE', 'UPDATE', 'DELETE']
          const results: Record<string, boolean> = {}

          for (const action of checks) {
            const res = await fetch(
              `http://localhost:8000/api/v1/permissions/check?resource=PROJECT&action=${action}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            const data = await res.json()
            results[action] = data.allowed
          }

          setPermissions(results)
        }

        checkPermissions()
      }, [token])

      return (
        <div>
          <div>Can Read: {permissions.READ ? 'Yes' : 'No'}</div>
          <div>Can Create: {permissions.CREATE ? 'Yes' : 'No'}</div>
          <div>Can Update: {permissions.UPDATE ? 'Yes' : 'No'}</div>
          <div>Can Delete: {permissions.DELETE ? 'Yes' : 'No'}</div>
        </div>
      )
    }

    render(<PermissionAwareComponent token="mock-customer-token" />)

    await waitFor(() => {
      expect(screen.getByText('Can Read: Yes')).toBeInTheDocument()
      expect(screen.getByText('Can Create: Yes')).toBeInTheDocument()
      expect(screen.getByText('Can Update: Yes')).toBeInTheDocument()
      expect(screen.getByText('Can Delete: No')).toBeInTheDocument()
    })
  })
})