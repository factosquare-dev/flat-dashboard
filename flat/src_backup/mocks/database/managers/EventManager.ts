/**
 * Event Manager
 * Handles database events and subscriptions
 */

import { DbEvent, DbEventType, MockDatabase } from '@/mocks/database/types';

export class EventManager {
  private listeners: Map<string, Set<(event: DbEvent) => void>>;

  constructor() {
    this.listeners = new Map();
  }

  /**
   * Emit an event to all relevant listeners
   */
  emitEvent(event: DbEvent): void {
    // Notify specific collection listeners
    const collectionListeners = this.listeners.get(event.collection);
    if (collectionListeners) {
      collectionListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('[MockDB] Event listener error:', error);
        }
      });
    }

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('[MockDB] Wildcard listener error:', error);
        }
      });
    }
  }

  /**
   * Subscribe to database events
   */
  subscribe(collection: keyof MockDatabase | '*', callback: (event: DbEvent) => void): () => void {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, new Set());
    }
    
    this.listeners.get(collection)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(collection);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Create an event
   */
  createEvent(
    type: DbEventType,
    collection: keyof MockDatabase,
    id: string,
    data?: any,
    previousData?: any
  ): DbEvent {
    return {
      type,
      collection,
      id,
      data,
      previousData,
      timestamp: new Date(),
    };
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get listener count for a collection
   */
  getListenerCount(collection: keyof MockDatabase | '*'): number {
    return this.listeners.get(collection)?.size || 0;
  }

  /**
   * Get all listener counts
   */
  getAllListenerCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.listeners.forEach((listeners, collection) => {
      counts[collection] = listeners.size;
    });
    return counts;
  }
}