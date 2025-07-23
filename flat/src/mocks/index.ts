/**
 * Mock 데이터 중앙 관리
 * 개발 환경에서만 사용되며, 프로덕션에서는 실제 API를 사용합니다.
 */

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || true; // TODO: Set to false when backend is ready

// Mock 데이터 exports
export * from './schedule';
export * from './project';
export * from './gantt';
export * from './factory';
export * from './user';

// Mock 데이터 초기화 함수
export const initializeMockData = () => {
  if (!USE_MOCK_DATA) return;
  
  console.info('🔧 Mock 데이터를 초기화합니다...');
  
  // 각 도메인별 초기화 함수 호출
  // 필요시 각 모듈에서 초기화 함수를 export하여 여기서 호출
};