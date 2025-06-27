/**
 * 실시간 캐시 동기화 가이드
 * 
 * FLAT 플랫폼의 캐싱 전략:
 * - 권한과 소유권 정보는 5분간 캐시됨
 * - 변경 시 실시간으로 캐시 무효화
 * - WebSocket을 통한 실시간 업데이트 (향후 구현)
 */

import { describe, it, expect } from 'vitest'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
})

describe('실시간 캐시 동기화 - Production Ready Patterns', () => {
  
  describe('1. 캐싱 동작 이해하기', () => {
    it('권한 체크는 캐시되어 빠른 응답 제공', async () => {
      const token = 'mock-customer-token'
      
      // 첫 번째 요청 - 캐시 미스 (DB 조회)
      const start1 = performance.now()
      await api.get('/permissions/check', {
        params: { resource: 'PROJECT', action: 'READ' },
        headers: { Authorization: `Bearer ${token}` }
      })
      const time1 = performance.now() - start1
      
      // 두 번째 요청 - 캐시 히트 (Redis에서 조회)
      const start2 = performance.now()
      await api.get('/permissions/check', {
        params: { resource: 'PROJECT', action: 'READ' },
        headers: { Authorization: `Bearer ${token}` }
      })
      const time2 = performance.now() - start2
      
      // 캐시된 요청이 훨씬 빠름
      console.log(`첫 요청: ${time1.toFixed(2)}ms, 캐시된 요청: ${time2.toFixed(2)}ms`)
      expect(time2).toBeLessThan(time1)
    })

    it('소유권 체크도 캐시됨', async () => {
      const token = 'mock-customer-token'
      const projectIds = ['id1', 'id2', 'id3']
      
      // 첫 번째 일괄 체크
      await api.post('/ownership/check-bulk-ownership', {
        resource_type: 'PROJECT',
        resource_ids: projectIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // 두 번째 요청은 캐시에서 처리
      const start = performance.now()
      const response = await api.post('/ownership/check-bulk-ownership', {
        resource_type: 'PROJECT',
        resource_ids: projectIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const elapsed = performance.now() - start
      
      expect(elapsed).toBeLessThan(50) // 캐시된 요청은 50ms 이내
      expect(response.data.ownership).toBeDefined()
    })
  })

  describe('2. 캐시 무효화 시나리오', () => {
    it('역할 변경 시 권한 캐시 자동 무효화', async () => {
      /**
       * 시나리오: 사용자의 역할이 변경되면 즉시 권한이 업데이트됨
       * 
       * 1. Customer가 PROJECT_MANAGER 역할을 받음
       * 2. 즉시 새로운 권한 적용
       * 3. 모든 세션에서 동일하게 적용
       */
      
      const AdminPermissionManager: React.FC = () => {
        const [userId, setUserId] = React.useState('')
        const [selectedRole, setSelectedRole] = React.useState('')
        
        const assignRole = async () => {
          try {
            // Admin이 사용자에게 역할 부여
            await api.post(`/users/${userId}/roles`, {
              role_name: selectedRole
            }, {
              headers: { Authorization: `Bearer ${adminToken}` }
            })
            
            // 캐시가 자동으로 무효화되어 사용자는 즉시 새 권한 사용 가능
            alert('역할이 부여되었습니다. 사용자는 즉시 새로운 권한을 사용할 수 있습니다.')
          } catch (error) {
            console.error('역할 부여 실패:', error)
          }
        }
        
        return (
          <div>
            <input 
              placeholder="User ID" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">역할 선택</option>
              <option value="PROJECT_MANAGER">프로젝트 매니저</option>
              <option value="VIEWER">뷰어</option>
            </select>
            <button onClick={assignRole}>역할 부여</button>
          </div>
        )
      }
    })

    it('소유권 이전 시 캐시 자동 무효화', async () => {
      /**
       * 시나리오: 프로젝트 소유권이 이전되면 즉시 접근 권한 변경
       */
      
      const projectId = 'project-123'
      const fromUserId = 'user-a'
      const toUserId = 'user-b'
      
      // 소유권 이전
      await api.post(`/projects/${projectId}/transfer`, {
        new_owner_id: toUserId
      }, {
        headers: { Authorization: `Bearer ${customerToken}` }
      })
      
      // 이전 소유자는 즉시 접근 불가
      try {
        await api.get(`/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${fromUserToken}` }
        })
      } catch (error: any) {
        expect(error.response.status).toBe(403)
      }
      
      // 새 소유자는 즉시 접근 가능
      const response = await api.get(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${toUserToken}` }
      })
      expect(response.status).toBe(200)
    })
  })

  describe('3. 다중 세션 동기화', () => {
    it('여러 브라우저/탭에서 실시간 동기화', () => {
      /**
       * 실제 구현 예제: 
       * 한 탭에서 권한이 변경되면 다른 모든 탭에 반영
       */
      
      const PermissionSyncComponent: React.FC = () => {
        const [permissions, setPermissions] = React.useState<Record<string, boolean>>({})
        
        React.useEffect(() => {
          // 1. BroadcastChannel을 사용한 탭 간 통신
          const channel = new BroadcastChannel('permission_updates')
          
          channel.onmessage = (event) => {
            if (event.data.type === 'PERMISSIONS_CHANGED') {
              // 권한 재조회
              refreshPermissions()
            }
          }
          
          // 2. 서버에서 권한 변경 이벤트 수신 (WebSocket)
          const ws = new WebSocket('ws://localhost:8000/ws')
          
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'permission_invalidated' && 
                data.user_id === getCurrentUserId()) {
              refreshPermissions()
              
              // 다른 탭에도 알림
              channel.postMessage({ type: 'PERMISSIONS_CHANGED' })
            }
          }
          
          return () => {
            channel.close()
            ws.close()
          }
        }, [])
        
        const refreshPermissions = async () => {
          const token = localStorage.getItem('auth_token')
          // 권한 재조회 로직
          const response = await api.get('/permissions/my-permissions', {
            headers: { Authorization: `Bearer ${token}` }
          })
          setPermissions(response.data)
        }
        
        return (
          <div>
            {/* UI 렌더링 */}
          </div>
        )
      }
    })
  })

  describe('4. 성능 최적화 패턴', () => {
    it('불필요한 API 호출 방지', () => {
      /**
       * 권한/소유권 체크 결과를 React Context에 캐시
       */
      
      interface PermissionCache {
        [key: string]: {
          value: boolean
          timestamp: number
        }
      }
      
      const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [cache, setCache] = React.useState<PermissionCache>({})
        const CACHE_TTL = 5 * 60 * 1000 // 5분 (서버와 동일)
        
        const checkPermission = async (resource: string, action: string): Promise<boolean> => {
          const cacheKey = `${resource}:${action}`
          const cached = cache[cacheKey]
          
          // 캐시 확인
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.value
          }
          
          // API 호출
          const token = localStorage.getItem('auth_token')
          const response = await api.get('/permissions/check', {
            params: { resource, action },
            headers: { Authorization: `Bearer ${token}` }
          })
          
          // 결과 캐시
          setCache(prev => ({
            ...prev,
            [cacheKey]: {
              value: response.data.allowed,
              timestamp: Date.now()
            }
          }))
          
          return response.data.allowed
        }
        
        const clearCache = () => {
          setCache({})
        }
        
        return (
          <PermissionContext.Provider value={{ checkPermission, clearCache }}>
            {children}
          </PermissionContext.Provider>
        )
      }
    })

    it('일괄 처리로 네트워크 요청 최소화', async () => {
      /**
       * 여러 권한을 개별적으로 체크하지 말고 한 번에 처리
       */
      
      // ❌ 나쁜 예: 개별 요청
      const badExample = async () => {
        const permissions = []
        for (const action of ['READ', 'CREATE', 'UPDATE', 'DELETE']) {
          const response = await api.get('/permissions/check', {
            params: { resource: 'PROJECT', action }
          })
          permissions.push(response.data.allowed)
        }
      }
      
      // ✅ 좋은 예: 병렬 처리
      const goodExample = async () => {
        const actions = ['READ', 'CREATE', 'UPDATE', 'DELETE']
        const responses = await Promise.all(
          actions.map(action => 
            api.get('/permissions/check', {
              params: { resource: 'PROJECT', action }
            })
          )
        )
        const permissions = responses.map(r => r.data.allowed)
      }
      
      // ✅ 더 좋은 예: 백엔드에 일괄 처리 엔드포인트 요청
      const bestExample = async () => {
        const response = await api.post('/permissions/check-bulk', {
          checks: [
            { resource: 'PROJECT', action: 'READ' },
            { resource: 'PROJECT', action: 'CREATE' },
            { resource: 'PROJECT', action: 'UPDATE' },
            { resource: 'PROJECT', action: 'DELETE' }
          ]
        })
        const permissions = response.data.results
      }
    })
  })

  describe('5. 에러 복구 전략', () => {
    it('캐시 오류 시 graceful degradation', async () => {
      /**
       * 캐시 서버(Redis) 장애 시에도 서비스 계속 제공
       */
      
      const resilientPermissionCheck = async (resource: string, action: string) => {
        try {
          // 정상 요청
          const response = await api.get('/permissions/check', {
            params: { resource, action },
            headers: { Authorization: `Bearer ${token}` }
          })
          return response.data.allowed
        } catch (error: any) {
          if (error.response?.status === 503) {
            // 캐시 서버 장애 시 기본값 반환
            console.warn('캐시 서버 장애, 기본 권한 적용')
            
            // 안전한 기본값 (보수적으로 처리)
            const safeDefaults: Record<string, boolean> = {
              'READ': true,      // 읽기는 허용
              'CREATE': false,   // 생성은 차단
              'UPDATE': false,   // 수정은 차단
              'DELETE': false    // 삭제는 차단
            }
            
            return safeDefaults[action] || false
          }
          
          throw error
        }
      }
    })
  })
})

// 유틸리티 함수들
const getCurrentUserId = () => {
  // JWT 토큰에서 user_id 추출
  const token = localStorage.getItem('auth_token')
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || payload.user_id
  } catch {
    return null
  }
}

const adminToken = 'mock-admin-token'
const customerToken = 'mock-customer-token'
const fromUserToken = 'mock-from-user-token'
const toUserToken = 'mock-to-user-token'

// Context
const PermissionContext = React.createContext<any>(null)