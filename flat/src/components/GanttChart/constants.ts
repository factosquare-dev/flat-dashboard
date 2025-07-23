/**
 * GanttChart constants and configuration
 */

import type { GanttConstants } from './types';
import { TIME_CONSTANTS } from '../../constants/time';

export const GANTT_CONSTANTS: GanttConstants = {
  CELL_WIDTH: 40,
  CELL_HEIGHT: 40,
  HEADER_HEIGHT: 60,
  SIDEBAR_WIDTH: 192, // w-48 = 12rem = 192px
};

export const baseDate = new Date("2025-07-01");
export const endDate = new Date("2025-08-31");
export const totalDays = Math.floor((endDate.getTime() - baseDate.getTime()) / TIME_CONSTANTS.DAY) + 1;