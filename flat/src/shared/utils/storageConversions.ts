/**
 * Local Storage Conversion Utilities
 * Convert localStorage data to/from branded types
 */

import {
  FactoryId,
  ProjectId,
  UserId,
  TaskId,
  CustomerId,
  toFactoryIdSafe,
  toProjectIdSafe,
  toUserIdSafe,
  toTaskIdSafe,
  toCustomerIdSafe,
  extractIdString
} from '@/shared/types/branded';
import type { User } from '@/shared/types/user';
import { convertApiUser } from './apiConversions';
import { localStorage as storageService } from '@/core/services/storageService';

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  CURRENT_USER: 'flat_current_user',
  SELECTED_PROJECT: 'flat_selected_project',
  SELECTED_FACTORY: 'flat_selected_factory',
  RECENT_PROJECTS: 'flat_recent_projects',
  RECENT_FACTORIES: 'flat_recent_factories',
  USER_PREFERENCES: 'flat_user_preferences',
  AUTH_TOKEN: 'flat_auth_token',
  REFRESH_TOKEN: 'flat_refresh_token',
  THEME: 'flat_theme',
  LOCALE: 'flat_locale'
} as const;

/**
 * Get current user from localStorage
 */
export const getCurrentUserFromStorage = (): User | null => {
  try {
    const raw = storageService.get<any>(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    
    return convertApiUser(raw);
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    return null;
  }
};

/**
 * Save current user to localStorage
 */
export const saveCurrentUserToStorage = (user: User): void => {
  const toStore = {
    ...user,
    id: extractIdString(user.id)
  };
  storageService.set(STORAGE_KEYS.CURRENT_USER, toStore);
};

/**
 * Get selected project ID from localStorage
 */
export const getSelectedProjectFromStorage = (): ProjectId | null => {
  const stored = storageService.get<string>(STORAGE_KEYS.SELECTED_PROJECT);
  if (!stored) return null;
  return toProjectIdSafe(stored) ?? null;
};

/**
 * Save selected project ID to localStorage
 */
export const saveSelectedProjectToStorage = (projectId: ProjectId): void => {
  storageService.set(STORAGE_KEYS.SELECTED_PROJECT, extractIdString(projectId));
};

/**
 * Get selected factory ID from localStorage
 */
export const getSelectedFactoryFromStorage = (): FactoryId | null => {
  const stored = storageService.get<string>(STORAGE_KEYS.SELECTED_FACTORY);
  if (!stored) return null;
  return toFactoryIdSafe(stored) ?? null;
};

/**
 * Save selected factory ID to localStorage
 */
export const saveSelectedFactoryToStorage = (factoryId: FactoryId): void => {
  storageService.set(STORAGE_KEYS.SELECTED_FACTORY, extractIdString(factoryId));
};

/**
 * Get recent project IDs from localStorage
 */
export const getRecentProjectsFromStorage = (): ProjectId[] => {
  try {
    const raw = storageService.get<string[]>(STORAGE_KEYS.RECENT_PROJECTS);
    if (!raw) return [];
    
    return raw
      .map(id => toProjectIdSafe(id))
      .filter((id): id is ProjectId => id !== undefined);
  } catch (error) {
    console.error('Failed to parse recent projects:', error);
    return [];
  }
};

/**
 * Save recent project IDs to localStorage
 */
export const saveRecentProjectsToStorage = (projectIds: ProjectId[]): void => {
  const toStore = projectIds.map(id => extractIdString(id));
  storageService.set(STORAGE_KEYS.RECENT_PROJECTS, toStore);
};

/**
 * Add project to recent list
 */
export const addToRecentProjects = (projectId: ProjectId, maxRecent = 5): void => {
  const recent = getRecentProjectsFromStorage();
  const filtered = recent.filter(id => id !== projectId);
  const updated = [projectId, ...filtered].slice(0, maxRecent);
  saveRecentProjectsToStorage(updated);
};

/**
 * Get recent factory IDs from localStorage
 */
export const getRecentFactoriesFromStorage = (): FactoryId[] => {
  try {
    const stored = storageService.get<string[]>(STORAGE_KEYS.RECENT_FACTORIES);
    if (!stored) return [];
    
    const raw = JSON.parse(stored) as string[];
    return raw
      .map(id => toFactoryIdSafe(id))
      .filter((id): id is FactoryId => id !== undefined);
  } catch (error) {
    console.error('Failed to parse recent factories:', error);
    return [];
  }
};

/**
 * Save recent factory IDs to localStorage
 */
export const saveRecentFactoriesToStorage = (factoryIds: FactoryId[]): void => {
  const toStore = factoryIds.map(id => extractIdString(id));
  localStorage.setItem(STORAGE_KEYS.RECENT_FACTORIES, JSON.stringify(toStore));
};

/**
 * Add factory to recent list
 */
export const addToRecentFactories = (factoryId: FactoryId, maxRecent = 5): void => {
  const recent = getRecentFactoriesFromStorage();
  const filtered = recent.filter(id => id !== factoryId);
  const updated = [factoryId, ...filtered].slice(0, maxRecent);
  saveRecentFactoriesToStorage(updated);
};

/**
 * User preferences with branded types
 */
export interface UserPreferences {
  defaultProjectId?: ProjectId;
  defaultFactoryId?: FactoryId;
  favoriteProjectIds?: ProjectId[];
  favoriteFactoryIds?: FactoryId[];
}

/**
 * Get user preferences from localStorage
 */
export const getUserPreferencesFromStorage = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!stored) return {};
    
    const raw = JSON.parse(stored);
    return {
      defaultProjectId: raw.defaultProjectId ? toProjectIdSafe(raw.defaultProjectId) : undefined,
      defaultFactoryId: raw.defaultFactoryId ? toFactoryIdSafe(raw.defaultFactoryId) : undefined,
      favoriteProjectIds: (raw.favoriteProjectIds ?? [])
        .map((id: string) => toProjectIdSafe(id))
        .filter((id: ProjectId | undefined): id is ProjectId => id !== undefined),
      favoriteFactoryIds: (raw.favoriteFactoryIds ?? [])
        .map((id: string) => toFactoryIdSafe(id))
        .filter((id: FactoryId | undefined): id is FactoryId => id !== undefined)
    };
  } catch (error) {
    console.error('Failed to parse user preferences:', error);
    return {};
  }
};

/**
 * Save user preferences to localStorage
 */
export const saveUserPreferencesToStorage = (preferences: UserPreferences): void => {
  const toStore = {
    defaultProjectId: preferences.defaultProjectId ? extractIdString(preferences.defaultProjectId) : undefined,
    defaultFactoryId: preferences.defaultFactoryId ? extractIdString(preferences.defaultFactoryId) : undefined,
    favoriteProjectIds: preferences.favoriteProjectIds?.map(id => extractIdString(id)),
    favoriteFactoryIds: preferences.favoriteFactoryIds?.map(id => extractIdString(id))
  };
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(toStore));
};

/**
 * Auth token management
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const saveAuthToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const saveRefreshToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Theme and locale management
 */
export const getTheme = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.THEME);
};

export const saveTheme = (theme: string): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getLocale = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LOCALE);
};

export const saveLocale = (locale: string): void => {
  localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
};

/**
 * Clear all storage
 */
export const clearAllStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};