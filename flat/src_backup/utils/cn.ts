import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines clsx and tailwind-merge for optimal Tailwind CSS class merging
 * This utility ensures that conflicting Tailwind classes are properly resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}