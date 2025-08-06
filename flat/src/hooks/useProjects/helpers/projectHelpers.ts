/**
 * Project helper functions
 */

import { factories } from '@/data/factories';
import { formatDateISO } from '@/utils/coreUtils';

/**
 * Get a date relative to today
 */
export const getRelativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return formatDateISO(date);
};

/**
 * Get a random factory of a specific type
 */
export const getRandomFactory = (type: string) => {
  const filteredFactories = factories.filter(f => f.type === type);
  return filteredFactories[Math.floor(Math.random() * filteredFactories.length)];
};

/**
 * Constants for simulation
 */
export const SIMULATION_CONSTANTS = {
  API_DELAY: 300,
  TOTAL_COUNT: 500,
} as const;