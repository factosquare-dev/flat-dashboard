/**
 * Interface for seed data to avoid circular dependency
 */

import type { MockDatabase } from './types';

export interface SeedDataInterface {
  createInitialData(): MockDatabase;
  createTasksForProject(
    project: any,
    scheduleId: string,
    pmUser: any,
    factoryManager: any,
    qaUser: any
  ): any[];
}