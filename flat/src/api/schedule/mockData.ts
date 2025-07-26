import type { Schedule } from '../../types/schedule';
import { createMockSchedules } from '../../data/mockSchedules';

// Mock 데이터 저장소
export const mockSchedules = new Map<string, Schedule>();

// 초기 테스트 데이터 로드
export const initializeMockSchedules = () => {
  const testSchedules = createMockSchedules();
  testSchedules.forEach(schedule => {
    mockSchedules.set(schedule.id, schedule);
  });
};

// 초기화
initializeMockSchedules();