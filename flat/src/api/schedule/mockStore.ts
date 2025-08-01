/**
 * Schedule Mock 데이터 저장소
 */

import type { Schedule } from '../../types/schedule';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

// Mock 데이터 저장소
export const mockSchedules = new Map<string, Schedule>();

export const initializeScheduleMockData = () => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    const schedules = Array.from(database.schedules.values());
    
    schedules.forEach(schedule => {
      mockSchedules.set(schedule.id, schedule);
    });
  } catch (error) {
    console.warn('[Schedule] Failed to load schedules from MockDB:', error);
  }
};

initializeScheduleMockData();