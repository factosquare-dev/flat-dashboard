/**
 * Schedule loading operations
 */

import type { ProjectId } from '@/shared/types/branded';
import type { Schedule } from '@/shared/types/schedule';
import { scheduleApi } from '@/core/api/scheduleApi';

/**
 * Load schedule for a project
 */
export const loadScheduleForProject = async (
  projectId: ProjectId,
  schedules: Map<string, Schedule>
): Promise<Map<string, Schedule>> => {
  try {
    const schedule = await scheduleApi.getScheduleByProjectId(projectId);
    if (schedule) {
      const newSchedules = new Map(schedules);
      newSchedules.set(projectId, schedule);
      return newSchedules;
    }
  } catch (error) {
    console.error(`Failed to load schedule for project ${projectId}:`, error);
  }
  return schedules;
};