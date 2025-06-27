/**
 * 권한 및 소유권 기반 접근 제어 가이드
 * 
 * FLAT 플랫폼의 2단계 접근 제어:
 * 1. Permission (권한): 사용자의 역할(Role)에 따른 작업 권한
 * 2. Ownership (소유권): 리소스에 대한 소유권 확인
 * 
 * 중요: 대부분의 작업은 권한과 소유권을 모두 확인합니다!
 */

import { describe, it, expect } from 'vitest'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// 테스트용 토큰
const customerToken = 'mock-customer-token'
const adminToken = 'mock-admin-token'

describe('권한 및 소유권 가이드 - Frontend Developer Must Know', () => {
  
  describe('1. 권한(Permission) 확인 API', () => {
    it('특정 작업에 대한 권한 확인', async () => {
      /**
       * GET /api/v1/permissions/check
       * 
       * Query Parameters:
       * - resource: 리소스 타입 (PROJECT, ORDER, TASK 등)
       * - action: 작업 타입 (READ, CREATE, UPDATE, DELETE)
       * 
       * Response:
       * {
       *   allowed: boolean
       * }
       */
      
      const response = await api.get('/permissions/check', {
        params: {
          resource: 'PROJECT',
          action: 'CREATE'
        },
        headers: {
          Authorization: `Bearer ${customerToken}`
        }
      })

      expect(response.data.allowed).toBe(true) // Customer는 프로젝트 생성 가능
    })

    it('여러 권한 동시 확인 (효율적)', async () => {
      /**
       * 여러 권한을 한 번에 확인하는 패턴
       * Promise.all을 사용하여 병렬 처리
       */
      
      const permissions = ['READ', 'CREATE', 'UPDATE', 'DELETE']
      
      const results = await Promise.all(
        permissions.map(action => 
          api.get('/permissions/check', {
            params: { resource: 'PROJECT', action },
            headers: { Authorization: `Bearer ${customerToken}` }
          })
        )
      )

      const permissionMap = permissions.reduce((acc, action, index) => {
        acc[action] = results[index].data.allowed
        return acc
      }, {} as Record<string, boolean>)

      expect(permissionMap).toEqual({
        READ: true,
        CREATE: true,
        UPDATE: true,
        DELETE: false  // Customer는 삭제 권한 없음
      })
    })
  })

  describe('2. 소유권(Ownership) 확인 API', () => {
    it('단일 리소스 소유권 확인', async () => {
      /**
       * 프로젝트 접근 시 자동으로 소유권 확인됨
       * 403 Forbidden: 소유권 없음
       * 404 Not Found: 리소스 없음
       * 200 OK: 접근 가능
       */
      
      const projectId = '323e4567-e89b-12d3-a456-426614174000'
      
      try {
        const response = await api.get(`/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${customerToken}` }
        })
        
        expect(response.status).toBe(200)
        expect(response.data.project_id).toBe(projectId)
      } catch (error: any) {
        if (error.response?.status === 403) {
          console.log('소유권이 없는 프로젝트입니다')
        }
      }
    })

    it('여러 리소스 소유권 일괄 확인', async () => {
      /**
       * POST /api/v1/ownership/check-bulk-ownership
       * 
       * Request Body:
       * {
       *   resource_type: string
       *   resource_ids: string[]
       * }
       * 
       * Response:
       * {
       *   ownership: {
       *     [resource_id]: boolean
       *   }
       * }
       */
      
      const projectIds = [
        '323e4567-e89b-12d3-a456-426614174000',
        '423e4567-e89b-12d3-a456-426614174000',
        '523e4567-e89b-12d3-a456-426614174000'  // 이 프로젝트는 소유하지 않음
      ]

      const response = await api.post('/ownership/check-bulk-ownership', {
        resource_type: 'PROJECT',
        resource_ids: projectIds
      }, {
        headers: { Authorization: `Bearer ${customerToken}` }
      })

      expect(response.data.ownership).toEqual({
        '323e4567-e89b-12d3-a456-426614174000': true,
        '423e4567-e89b-12d3-a456-426614174000': true,
        '523e4567-e89b-12d3-a456-426614174000': false
      })
    })

    it('내가 소유한 리소스 목록 가져오기', async () => {
      /**
       * GET /api/v1/ownership/my-projects
       * GET /api/v1/ownership/my-tasks
       * GET /api/v1/ownership/my-notifications
       * 
       * 소유한 리소스만 필터링되어 반환됨
       */
      
      const response = await api.get('/ownership/my-projects', {
        headers: { Authorization: `Bearer ${customerToken}` }
      })

      expect(response.data).toMatchObject({
        user_id: expect.any(String),
        owned_projects: expect.any(Array),
        count: expect.any(Number)
      })
    })
  })

  describe('3. 실제 사용 패턴', () => {
    it('프로젝트 생성 플로우', async () => {
      /**
       * 프로젝트 생성 시 권한과 소유권 처리
       */
      
      // 1. 먼저 생성 권한 확인 (선택적, UI에서 버튼 표시 여부 결정)
      const permissionCheck = await api.get('/permissions/check', {
        params: { resource: 'PROJECT', action: 'CREATE' },
        headers: { Authorization: `Bearer ${customerToken}` }
      })

      if (!permissionCheck.data.allowed) {
        throw new Error('프로젝트 생성 권한이 없습니다')
      }

      // 2. 프로젝트 생성
      const createResponse = await api.post('/projects', {
        name: 'New Project',
        description: 'Test project'
      }, {
        headers: { Authorization: `Bearer ${customerToken}` }
      })

      const newProject = createResponse.data
      expect(newProject.customer_id).toBe('223e4567-e89b-12d3-a456-426614174000') // 자동으로 소유자 설정됨
    })

    it('프로젝트 수정 플로우', async () => {
      /**
       * 수정 시 권한과 소유권 모두 필요
       */
      
      const projectId = '323e4567-e89b-12d3-a456-426614174000'

      try {
        const response = await api.patch(`/projects/${projectId}`, {
          description: 'Updated description'
        }, {
          headers: { Authorization: `Bearer ${customerToken}` }
        })

        expect(response.status).toBe(200)
      } catch (error: any) {
        if (error.response?.status === 403) {
          // 권한 또는 소유권 부족
          const errorDetail = error.response.data.detail
          console.log('접근 거부:', errorDetail)
        }
      }
    })

    it('소유권 이전', async () => {
      /**
       * POST /api/v1/projects/{project_id}/transfer
       * 
       * 프로젝트 소유권을 다른 사용자에게 이전
       * TRANSFER 권한과 현재 소유권 필요
       */
      
      const projectId = '323e4567-e89b-12d3-a456-426614174000'
      const newOwnerId = '723e4567-e89b-12d3-a456-426614174000'

      const response = await api.post(`/projects/${projectId}/transfer`, {
        new_owner_id: newOwnerId
      }, {
        headers: { Authorization: `Bearer ${customerToken}` }
      })

      expect(response.data).toMatchObject({
        project_id: projectId,
        previous_owner: '223e4567-e89b-12d3-a456-426614174000',
        new_owner: newOwnerId,
        status: 'transferred'
      })
    })

    it('Admin은 모든 리소스 접근 가능', async () => {
      /**
       * Admin 역할은 소유권 체크를 우회
       * 시스템 관리를 위해 필요
       */
      
      // 다른 사용자의 프로젝트도 접근 가능
      const response = await api.get('/projects/any-project-id', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })

      expect(response.status).toBe(200)
    })
  })

  describe('4. React 컴포넌트에서 사용', () => {
    it('권한 기반 UI 렌더링', () => {
      /**
       * 권한에 따라 UI 요소를 조건부 렌더링
       */
      
      const ProjectActions: React.FC<{ projectId: string }> = ({ projectId }) => {
        const [permissions, setPermissions] = React.useState({
          canEdit: false,
          canDelete: false,
          canTransfer: false
        })

        React.useEffect(() => {
          const checkPermissions = async () => {
            const token = localStorage.getItem('auth_token')
            
            const [edit, del, transfer] = await Promise.all([
              api.get('/permissions/check', {
                params: { resource: 'PROJECT', action: 'UPDATE' },
                headers: { Authorization: `Bearer ${token}` }
              }),
              api.get('/permissions/check', {
                params: { resource: 'PROJECT', action: 'DELETE' },
                headers: { Authorization: `Bearer ${token}` }
              }),
              api.get('/permissions/check', {
                params: { resource: 'PROJECT', action: 'TRANSFER' },
                headers: { Authorization: `Bearer ${token}` }
              })
            ])

            setPermissions({
              canEdit: edit.data.allowed,
              canDelete: del.data.allowed,
              canTransfer: transfer.data.allowed
            })
          }

          checkPermissions()
        }, [])

        return (
          <div className="project-actions">
            {permissions.canEdit && (
              <button className="btn-edit">수정</button>
            )}
            {permissions.canDelete && (
              <button className="btn-delete">삭제</button>
            )}
            {permissions.canTransfer && (
              <button className="btn-transfer">소유권 이전</button>
            )}
          </div>
        )
      }
    })

    it('소유권 기반 리소스 필터링', () => {
      /**
       * 소유한 리소스만 표시하는 컴포넌트
       */
      
      const MyProjects: React.FC = () => {
        const [projects, setProjects] = React.useState([])
        const [loading, setLoading] = React.useState(true)

        React.useEffect(() => {
          const fetchMyProjects = async () => {
            const token = localStorage.getItem('auth_token')
            
            try {
              // 내가 소유한 프로젝트만 가져옴
              const response = await api.get('/ownership/my-projects', {
                headers: { Authorization: `Bearer ${token}` }
              })
              
              setProjects(response.data.owned_projects)
            } catch (error) {
              console.error('프로젝트 로드 실패:', error)
            } finally {
              setLoading(false)
            }
          }

          fetchMyProjects()
        }, [])

        if (loading) return <div>Loading...</div>

        return (
          <div className="my-projects">
            <h2>내 프로젝트 ({projects.length}개)</h2>
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )
      }
    })
  })

  describe('5. 에러 처리 가이드', () => {
    it('접근 제어 에러 구분', async () => {
      /**
       * 401: 인증되지 않음 (토큰 없음/만료)
       * 403: 권한 또는 소유권 없음
       * 404: 리소스 없음
       */
      
      try {
        await api.get('/projects/some-project-id')
      } catch (error: any) {
        switch (error.response?.status) {
          case 401:
            // 로그인 페이지로 리다이렉트
            window.location.href = '/login'
            break
          
          case 403:
            // 접근 권한 없음 메시지 표시
            alert('이 리소스에 접근할 권한이 없습니다')
            break
          
          case 404:
            // 리소스 없음
            alert('요청한 리소스를 찾을 수 없습니다')
            break
        }
      }
    })
  })
})

// 유틸리티 타입 정의
interface Permission {
  resource: string
  action: string
  allowed: boolean
}

interface OwnershipCheck {
  resource_type: string
  resource_id: string
  is_owner: boolean
}

// 재사용 가능한 훅
const usePermissions = (resource: string, actions: string[]) => {
  const [permissions, setPermissions] = React.useState<Record<string, boolean>>({})
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const checkPermissions = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const results = await Promise.all(
        actions.map(action =>
          api.get('/permissions/check', {
            params: { resource, action },
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      )

      const permMap = actions.reduce((acc, action, index) => {
        acc[action] = results[index].data.allowed
        return acc
      }, {} as Record<string, boolean>)

      setPermissions(permMap)
      setLoading(false)
    }

    checkPermissions()
  }, [resource, actions])

  return { permissions, loading }
}

// Mock components
const ProjectCard: React.FC<{ project: any }> = ({ project }) => <div>{project.name}</div>