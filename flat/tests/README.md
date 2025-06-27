# FLAT Frontend Tests Guide

## 📚 Overview

이 테스트들은 프론트엔드 개발자를 위한 **Living Documentation**입니다.
각 테스트 파일은 실제 API 사용법과 구현 패턴을 보여줍니다.

## 🗂️ 테스트 구조

```
tests/
├── integration/          # API 통합 테스트 (개발자 가이드)
│   ├── auth-flow.test.tsx              # 인증 플로우 가이드
│   ├── permission-ownership-guide.test.tsx  # 권한/소유권 가이드
│   └── real-time-cache-sync.test.tsx   # 캐시 동기화 가이드
├── unit/                # 유닛 테스트
├── e2e/                 # End-to-End 테스트 (Playwright)
├── mocks/               # MSW 핸들러
└── setup.ts            # 테스트 환경 설정
```

## 🚀 시작하기

### 설치
```bash
npm install
```

### 테스트 실행
```bash
# 모든 테스트
npm test

# 유닛 테스트만
npm run test:unit

# 통합 테스트만
npm run test:integration

# E2E 테스트
npm run test:e2e

# UI 모드로 실행
npm run test:ui
```

## 📖 Integration Tests as Documentation

### 1. 인증 플로우 (`auth-flow.test.tsx`)

**로그인 API**
```typescript
const response = await api.post('/auth/login', {
  email: 'customer@test.com',
  password: 'Customer123!'
})

// Response
{
  access_token: string,
  token_type: "bearer",
  user: {
    user_id: string,
    email: string,
    username: string,
    roles: string[]
  }
}
```

**토큰 관리**
```typescript
// 저장
localStorage.setItem('auth_token', response.data.access_token)

// API 요청에 포함
api.defaults.headers.common['Authorization'] = `Bearer ${token}`
```

### 2. 권한 및 소유권 (`permission-ownership-guide.test.tsx`)

**권한 확인**
```typescript
// 단일 권한 체크
const response = await api.get('/permissions/check', {
  params: { resource: 'PROJECT', action: 'CREATE' }
})

// 여러 권한 동시 체크 (추천)
const permissions = await Promise.all([
  api.get('/permissions/check', { params: { resource: 'PROJECT', action: 'READ' } }),
  api.get('/permissions/check', { params: { resource: 'PROJECT', action: 'CREATE' } }),
  api.get('/permissions/check', { params: { resource: 'PROJECT', action: 'UPDATE' } })
])
```

**소유권 확인**
```typescript
// 일괄 소유권 체크
const response = await api.post('/ownership/check-bulk-ownership', {
  resource_type: 'PROJECT',
  resource_ids: ['id1', 'id2', 'id3']
})

// Response
{
  ownership: {
    'id1': true,
    'id2': true,
    'id3': false
  }
}
```

### 3. 캐시 동기화 (`real-time-cache-sync.test.tsx`)

**캐싱 이해**
- 권한/소유권 정보는 5분간 캐시됨
- 변경 시 자동으로 캐시 무효화
- 여러 세션 간 실시간 동기화

**성능 최적화 패턴**
```typescript
// React Context로 클라이언트 캐싱
const PermissionProvider = ({ children }) => {
  const [cache, setCache] = useState({})
  
  const checkPermission = async (resource, action) => {
    const cacheKey = `${resource}:${action}`
    
    // 캐시 확인
    if (cache[cacheKey]) return cache[cacheKey]
    
    // API 호출
    const response = await api.get('/permissions/check', {
      params: { resource, action }
    })
    
    // 결과 캐시
    setCache(prev => ({
      ...prev,
      [cacheKey]: response.data.allowed
    }))
    
    return response.data.allowed
  }
  
  return (
    <PermissionContext.Provider value={{ checkPermission }}>
      {children}
    </PermissionContext.Provider>
  )
}
```

## 🔑 핵심 개념

### 권한(Permission) vs 소유권(Ownership)

| 구분 | 권한 | 소유권 |
|------|------|---------|
| 정의 | 역할에 따른 작업 권한 | 리소스에 대한 소유 여부 |
| 예시 | PROJECT.CREATE 권한 | 특정 프로젝트의 소유자 |
| 체크 | `/permissions/check` | 리소스 접근 시 자동 |
| 캐싱 | 5분 | 5분 |

### 에러 코드

| 코드 | 의미 | 처리 방법 |
|------|------|-----------|
| 401 | 인증되지 않음 | 로그인 페이지로 이동 |
| 403 | 권한/소유권 없음 | 에러 메시지 표시 |
| 404 | 리소스 없음 | 404 페이지 표시 |

## 🛠️ 유용한 Hooks

### usePermissions
```typescript
const { permissions, loading } = usePermissions('PROJECT', ['READ', 'CREATE', 'UPDATE'])

// 사용
{permissions.CREATE && <CreateButton />}
```

### useOwnership
```typescript
const { isOwner, loading } = useOwnership('PROJECT', projectId)

// 사용
{isOwner && <EditButton />}
```

## 📝 테스트 작성 가이드

### Integration Test 작성
```typescript
describe('새로운 기능 가이드', () => {
  it('API 사용 예제', async () => {
    // 1. API 호출 방법 설명
    const response = await api.post('/endpoint', data)
    
    // 2. 응답 형식 문서화
    expect(response.data).toMatchObject({
      field1: expect.any(String),
      field2: expect.any(Number)
    })
    
    // 3. 에러 처리 예제
    try {
      await api.post('/endpoint', invalidData)
    } catch (error) {
      expect(error.response.status).toBe(400)
    }
  })
})
```

## 🐛 트러블슈팅

### 테스트 실패 시
1. MSW 핸들러 확인 (`tests/mocks/handlers.ts`)
2. 환경 변수 확인
3. 의존성 버전 확인

### 캐시 관련 이슈
1. 로컬 스토리지 초기화
2. 테스트 간 격리 확인
3. Mock 타이밍 이슈 확인

## 📚 추가 리소스

- [Vitest 문서](https://vitest.dev/)
- [Testing Library 문서](https://testing-library.com/)
- [MSW 문서](https://mswjs.io/)
- [Playwright 문서](https://playwright.dev/)