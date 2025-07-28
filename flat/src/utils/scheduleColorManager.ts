/**
 * Schedule Color Manager
 * 
 * Single Source of Truth for schedule participant colors
 * Follows SOLID-FLAT principles:
 * - S: Single responsibility - Only manages color assignments
 * - O: Open for extension - Easy to add new color schemes
 * - D: Dependency inversion - Provides interface, not implementation
 */

import { FactoryId } from '../types/branded';

// Type-safe color values (Foundation - Level 1 Type Safety)
export const SCHEDULE_COLORS = {
  BLUE: "#3b82f6",    // blue-500
  RED: "#ef4444",     // red-500
  GREEN: "#22c55e",   // green-500
  YELLOW: "#eab308",  // yellow-500
  PURPLE: "#a855f7",  // purple-500
  PINK: "#ec4899",    // pink-500
  INDIGO: "#6366f1",  // indigo-500
  ORANGE: "#f97316",  // orange-500
  TEAL: "#14b8a6",    // teal-500
  CYAN: "#06b6d4"     // cyan-500
} as const;

export type ScheduleColor = typeof SCHEDULE_COLORS[keyof typeof SCHEDULE_COLORS];

// Storage configuration
const STORAGE_CONFIG = {
  KEY: 'flat_schedule_colors',
  VERSION: '1.0.0'
} as const;

// Type-safe storage structure
interface ColorStorage {
  version: string;
  assignments: Record<string, ScheduleColor>;
  lastUpdated: string;
}

// Module state - encapsulated
class ColorAssignmentManager {
  private assignments: Map<string, ScheduleColor> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize the manager - loads data from storage
   * Follows "Fail Fast, Fail Loud" principle
   */
  private initialize(): void {
    if (this.initialized) return;
    
    try {
      const stored = localStorage.getItem(STORAGE_CONFIG.KEY);
      if (stored) {
        const data: ColorStorage = JSON.parse(stored);
        
        // Version check - handle migrations if needed
        if (data.version === STORAGE_CONFIG.VERSION) {
          Object.entries(data.assignments).forEach(([id, color]) => {
            if (this.isValidColor(color)) {
              this.assignments.set(id, color);
            }
          });
        }
      }
    } catch (error) {
      console.error('[ColorManager] Failed to load assignments:', error);
      // Don't throw - gracefully fallback to empty assignments
    }
    
    this.initialized = true;
  }

  /**
   * Save assignments to storage
   */
  private persist(): void {
    try {
      const data: ColorStorage = {
        version: STORAGE_CONFIG.VERSION,
        assignments: Object.fromEntries(this.assignments),
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_CONFIG.KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[ColorManager] Failed to persist assignments:', error);
      // Non-critical error - don't throw
    }
  }

  /**
   * Type guard for valid colors
   */
  private isValidColor(color: string): color is ScheduleColor {
    return Object.values(SCHEDULE_COLORS).includes(color as ScheduleColor);
  }

  /**
   * Get a random color from available colors
   */
  private getRandomColor(): ScheduleColor {
    const colors = Object.values(SCHEDULE_COLORS);
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get color for a participant (factory)
   * Returns existing color or assigns a new random color
   */
  getColor(participantId: string): ScheduleColor {
    this.initialize();
    
    // Check existing assignment
    const existing = this.assignments.get(participantId);
    if (existing) return existing;
    
    // Assign new color
    const newColor = this.getRandomColor();
    this.assignments.set(participantId, newColor);
    this.persist();
    
    return newColor;
  }

  /**
   * Set specific color for a participant
   */
  setColor(participantId: string, color: ScheduleColor): void {
    this.initialize();
    
    if (!this.isValidColor(color)) {
      throw new Error(`Invalid color: ${color}`);
    }
    
    this.assignments.set(participantId, color);
    this.persist();
  }

  /**
   * Get all assignments (immutable)
   */
  getAllAssignments(): ReadonlyMap<string, ScheduleColor> {
    this.initialize();
    return new Map(this.assignments);
  }

  /**
   * Clear all assignments
   */
  clear(): void {
    this.assignments.clear();
    try {
      localStorage.removeItem(STORAGE_CONFIG.KEY);
    } catch (error) {
      console.error('[ColorManager] Failed to clear storage:', error);
    }
    this.initialized = true;
  }

  /**
   * Check if color is assigned
   */
  hasColor(participantId: string): boolean {
    this.initialize();
    return this.assignments.has(participantId);
  }
}

// Singleton instance - Single Source of Truth
const colorManager = new ColorAssignmentManager();

// Public API - Dependency Inversion
export interface IColorManager {
  getColor(participantId: string): ScheduleColor;
  setColor(participantId: string, color: ScheduleColor): void;
  getAllAssignments(): ReadonlyMap<string, ScheduleColor>;
  clear(): void;
  hasColor(participantId: string): boolean;
}

// Export functions for backward compatibility
export const getParticipantColor = (id: string): ScheduleColor => colorManager.getColor(id);
export const setParticipantColor = (id: string, color: ScheduleColor): void => colorManager.setColor(id, color);
export const getAllColorAssignments = (): ReadonlyMap<string, ScheduleColor> => colorManager.getAllAssignments();
export const clearColorAssignments = (): void => colorManager.clear();

// Export the manager for advanced usage
export const scheduleColorManager: IColorManager = colorManager;