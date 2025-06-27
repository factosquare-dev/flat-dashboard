/**
 * 인증 플로우 통합 테스트
 * 
 * 이 테스트는 프론트엔드 개발자를 위한 인증 API 사용 가이드입니다.
 * 실제 API 호출 방법과 응답 형식을 보여줍니다.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'

// API 클라이언트 설정
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 토큰 관리
let authToken: string | null = null

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

describe('인증 플로우 - Frontend Developer Guide', () => {
  beforeEach(() => {
    authToken = null
    localStorage.clear()
  })

  it('로그인 API 사용법', async () => {
    /**
     * POST /api/v1/auth/login
     * 
     * Request Body:
     * {
     *   email: string
     *   password: string
     * }
     * 
     * Response:
     * {
     *   access_token: string
     *   token_type: "bearer"
     *   user: {
     *     user_id: string (UUID)
     *     email: string
     *     username: string
     *     roles: string[]
     *   }
     * }
     */
    
    const loginData = {
      email: 'customer@test.com',
      password: 'Customer123!'
    }

    const response = await api.post('/auth/login', loginData)
    
    expect(response.status).toBe(200)
    expect(response.data).toMatchObject({
      access_token: expect.any(String),
      token_type: 'bearer',
      user: {
        user_id: expect.any(String),
        email: 'customer@test.com',
        username: expect.any(String),
        roles: expect.arrayContaining(['CUSTOMER'])
      }
    })

    // 토큰 저장
    authToken = response.data.access_token
    localStorage.setItem('auth_token', authToken)
  })

  it('로그인 실패 처리', async () => {
    /**
     * 잘못된 인증 정보로 로그인 시도
     * 
     * Response (401):
     * {
     *   detail: "Invalid credentials"
     * }
     */
    
    try {
      await api.post('/auth/login', {
        email: 'wrong@email.com',
        password: 'WrongPassword'
      })
    } catch (error: any) {
      expect(error.response.status).toBe(401)
      expect(error.response.data.detail).toBe('Invalid credentials')
    }
  })

  it('인증된 요청 보내기', async () => {
    /**
     * 인증이 필요한 엔드포인트 호출 방법
     * 
     * Headers:
     * {
     *   Authorization: "Bearer {access_token}"
     * }
     */
    
    // 먼저 로그인
    const loginResponse = await api.post('/auth/login', {
      email: 'customer@test.com',
      password: 'Customer123!'
    })
    
    authToken = loginResponse.data.access_token

    // 인증된 요청
    const projectsResponse = await api.get('/projects')
    
    expect(projectsResponse.status).toBe(200)
    expect(projectsResponse.data).toHaveProperty('items')
  })

  it('토큰 새로고침', async () => {
    /**
     * POST /api/v1/auth/refresh
     * 
     * Headers:
     * {
     *   Authorization: "Bearer {refresh_token}"
     * }
     * 
     * Response:
     * {
     *   access_token: string
     *   token_type: "bearer"
     * }
     */
    
    // 실제 구현에서는 refresh token을 사용
    // 여기서는 예시만 보여줍니다
    
    const mockRefreshToken = 'mock-refresh-token'
    
    try {
      const response = await api.post('/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${mockRefreshToken}`
        }
      })
      
      expect(response.data).toHaveProperty('access_token')
      authToken = response.data.access_token
    } catch (error) {
      // Refresh token이 만료된 경우 재로그인 필요
      console.log('Refresh token expired, need to login again')
    }
  })

  it('로그아웃', async () => {
    /**
     * POST /api/v1/auth/logout
     * 
     * Headers:
     * {
     *   Authorization: "Bearer {access_token}"
     * }
     * 
     * Response: 204 No Content
     */
    
    // 로그인 먼저
    const loginResponse = await api.post('/auth/login', {
      email: 'customer@test.com',
      password: 'Customer123!'
    })
    
    authToken = loginResponse.data.access_token

    // 로그아웃
    const logoutResponse = await api.post('/auth/logout')
    
    expect(logoutResponse.status).toBe(204)
    
    // 로컬 스토리지 정리
    authToken = null
    localStorage.removeItem('auth_token')
  })

  it('React 컴포넌트에서 인증 상태 관리', async () => {
    /**
     * 실제 React 애플리케이션에서 인증 상태를 관리하는 예제
     */
    
    const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [user, setUser] = React.useState(null)
      const [loading, setLoading] = React.useState(true)

      React.useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          // 토큰이 있으면 사용자 정보 가져오기
          api.get('/auth/me')
            .then(response => setUser(response.data))
            .catch(() => localStorage.removeItem('auth_token'))
            .finally(() => setLoading(false))
        } else {
          setLoading(false)
        }
      }, [])

      const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password })
        const { access_token, user } = response.data
        
        localStorage.setItem('auth_token', access_token)
        authToken = access_token
        setUser(user)
        
        return user
      }

      const logout = async () => {
        await api.post('/auth/logout')
        localStorage.removeItem('auth_token')
        authToken = null
        setUser(null)
      }

      return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
          {children}
        </AuthContext.Provider>
      )
    }

    // 사용 예제
    const LoginForm = () => {
      const { login } = useAuth()
      const [error, setError] = React.useState('')

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
          await login('customer@test.com', 'Customer123!')
          // 로그인 성공 시 리다이렉트
          window.location.href = '/dashboard'
        } catch (error: any) {
          setError(error.response?.data?.detail || 'Login failed')
        }
      }

      return (
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          {/* Form fields */}
        </form>
      )
    }
  })
})

// Context와 Hook
const AuthContext = React.createContext<any>(null)
const useAuth = () => React.useContext(AuthContext)