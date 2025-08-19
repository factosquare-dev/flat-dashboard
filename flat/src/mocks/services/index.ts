/**
 * Mock Services Export
 * Provides unified access to all mock services
 */

export { BaseService } from './BaseService';
export { UserService } from './UserService';
export { FactoryService } from './FactoryService';
export { ProjectService } from './ProjectService';

import { UserService } from './UserService';
import { FactoryService } from './FactoryService';
import { ProjectService } from './ProjectService';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

// Service instances
let userService: UserService | null = null;
let factoryService: FactoryService | null = null;
let projectService: ProjectService | null = null;

/**
 * Initialize all services
 */
export function initializeServices() {
  // Ensure database is initialized
  MockDatabaseImpl.getInstance();
  
  // Initialize services
  userService = new UserService();
  factoryService = new FactoryService();
  projectService = new ProjectService();
  
}

/**
 * Get service instances
 */
export function getServices() {
  if (!userService || !factoryService || !projectService) {
    initializeServices();
  }
  
  return {
    users: userService!,
    factories: factoryService!,
    projects: projectService!,
  };
}

/**
 * Reset all services and database
 */
export function resetServices() {
  const db = MockDatabaseImpl.getInstance();
  db.reset();
  
  // Reinitialize services
  userService = null;
  factoryService = null;
  projectService = null;
  
  initializeServices();
}

/**
 * Export database for backup
 */
export function exportDatabase(): string {
  const db = MockDatabaseImpl.getInstance();
  return db.export();
}

/**
 * Import database from backup
 */
export function importDatabase(data: string): boolean {
  const db = MockDatabaseImpl.getInstance();
  const result = db.import(data);
  
  if (result.success) {
    // Reinitialize services to ensure they're using the new data
    initializeServices();
  }
  
  return result.success;
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
  const db = MockDatabaseImpl.getInstance();
  return db.getStats();
}

// Export service singletons for convenient access
export const services = getServices();
export const { users: userServiceInstance, factories: factoryServiceInstance, projects: projectServiceInstance, customers: customerServiceInstance } = services;

// Convenience exports
export { customerServiceInstance as customerService };