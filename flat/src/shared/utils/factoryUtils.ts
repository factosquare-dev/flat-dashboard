import type { Factory } from '@/core/database/factories';
import { FactoryType } from '@/shared/types/enums';
import { FactoryId, toFactoryId, toFactoryIdSafe, extractIdString } from '@/shared/types/branded';
import { FactoryNotFoundError, assertDefined } from '@/shared/utils/error';

/**
 * Get factory by ID with explicit error handling
 * Follows "Fail Fast, Fail Loud" principle
 */
export const getFactoryById = (factories: Factory[], id: FactoryId): Factory => {
  assertDefined(id, 'Factory ID is required');

  const factory = factories.find(f => f.id === id);
  
  if (!factory) {
    throw new FactoryNotFoundError(extractIdString(id));
  }
  
  return factory;
};

/**
 * Get factory by name with explicit error handling
 */
export const getFactoryByName = (factories: Factory[], name: string): Factory => {
  assertDefined(name, 'Factory name is required');

  const factory = factories.find(f => f.name === name);
  
  if (!factory) {
    throw new FactoryNotFoundError(`name:${name}`);
  }
  
  return factory;
};

/**
 * Safe factory getter with fallback
 * Use this when factory might not exist
 */
export const getFactoryByIdSafe = (
  factories: Factory[], 
  id: FactoryId
): Factory | undefined => {
  if (!id) return undefined;
  return factories.find(f => f.id === id);
};

/**
 * Get factories by type
 */
export const getFactoriesByType = (
  factories: Factory[], 
  type: FactoryType
): Factory[] => {
  return factories.filter(f => f.type === type);
};

/**
 * Check if factory exists
 */
export const factoryExists = (factories: Factory[], id: string): boolean => {
  return factories.some(f => f.id === id);
};

/**
 * Safe factory getter with name fallback for backward compatibility
 * Prioritizes ID lookup, falls back to name lookup
 * Use this during transition period from name-based to ID-based lookups
 */
export const getFactoryByIdOrName = (
  factories: Factory[], 
  idOrName: string
): Factory | undefined => {
  if (!idOrName) return undefined;
  
  // First try to find by ID (with safe conversion)
  const factoryId = toFactoryIdSafe(idOrName);
  let factory = factoryId ? factories.find(f => f.id === factoryId) : undefined;
  
  // If not found by ID, try by name for backward compatibility
  if (!factory) {
    factory = factories.find(f => f.name === idOrName);
  }
  
  return factory;
};

/**
 * Get factory name safely (returns name or fallback)
 */
export const getFactoryName = (
  factories: Factory[], 
  idOrName: string, 
  fallback: string = 'Unknown Factory'
): string => {
  const factory = getFactoryByIdOrName(factories, idOrName);
  return factory?.name || fallback;
};

/**
 * Get factory ID safely (returns ID or fallback)
 */
export const getFactoryId = (
  factories: Factory[], 
  idOrName: string, 
  fallback: string = ''
): string => {
  const factory = getFactoryByIdOrName(factories, idOrName);
  return factory ? extractIdString(factory.id) : fallback;
};

/**
 * Get factory type color based on FactoryType enum
 */
export const getFactoryTypeColor = (type: FactoryType): string => {
  switch (type) {
    case FactoryType.FRAGRANCE:
      return 'bg-purple-500';
    case FactoryType.MATERIAL:
      return 'bg-green-500';
    case FactoryType.MANUFACTURING:
      return 'bg-blue-500';
    case FactoryType.CONTAINER:
      return 'bg-red-500';
    case FactoryType.PACKAGING:
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Get factory type styles (background and text colors)
 */
export const getFactoryTypeStyles = (type: FactoryType): { bg: string; text: string } => {
  switch (type) {
    case FactoryType.FRAGRANCE:
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case FactoryType.MATERIAL:
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case FactoryType.MANUFACTURING:
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case FactoryType.CONTAINER:
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case FactoryType.PACKAGING:
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

/**
 * Get project name safely with fallback
 */
export const getProjectName = (projectName?: string): string => {
  return projectName || '프로젝트 미지정';
};