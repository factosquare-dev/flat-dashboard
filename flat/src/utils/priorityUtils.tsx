import React from 'react';
import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import type { Priority } from '../types/project';
import { logger } from './logger';

export interface PriorityInfo {
  code: string;
  displayName: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

// Cache for priority mappings
let priorityCache: Map<string, PriorityInfo> | null = null;

// Get priority info from DB
export const getPriorityInfo = (priority: Priority): PriorityInfo => {
  // Initialize cache if needed
  if (!priorityCache) {
    priorityCache = new Map();
    
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      
      Array.from(database.priorityMappings.values()).forEach(pm => {
        const info: PriorityInfo = {
          code: pm.code,
          displayName: pm.displayName,
          color: pm.color || '#6B7280',
          bgClass: getPriorityBgClass(pm.code),
          textClass: getPriorityTextClass(pm.code),
          borderClass: getPriorityBorderClass(pm.code)
        };
        
        // Store by both code and displayName for easy lookup
        priorityCache!.set(pm.code, info);
        priorityCache!.set(pm.displayName, info);
      });
    } catch (error) {
      logger.error('[getPriorityInfo] Error loading priority mappings', error, 'priorityUtils');
    }
  }
  
  // Return cached info or default
  return priorityCache.get(priority) || {
    code: priority,
    displayName: priority,
    color: '#6B7280',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-300'
  };
};

// Get priority display name
export const getPriorityDisplayName = (priority: Priority): string => {
  return getPriorityInfo(priority).displayName;
};

// Get priority style classes
export const getPriorityStyles = (priority: Priority): string => {
  const info = getPriorityInfo(priority);
  return `${info.bgClass} ${info.textClass} ${info.borderClass}`;
};

// Get priority icon component
export const getPriorityIcon = (priority: Priority) => {
  const info = getPriorityInfo(priority);
  
  switch (info.code) {
    case 'high':
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    case 'medium':
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    case 'low':
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
};

// Private helper functions
function getPriorityBgClass(code: string): string {
  switch (code) {
    case 'high': return 'bg-red-100';
    case 'medium': return 'bg-yellow-100';
    case 'low': return 'bg-green-100';
    default: return 'bg-gray-100';
  }
}

function getPriorityTextClass(code: string): string {
  switch (code) {
    case 'high': return 'text-red-700';
    case 'medium': return 'text-yellow-700';
    case 'low': return 'text-green-700';
    default: return 'text-gray-700';
  }
}

function getPriorityBorderClass(code: string): string {
  switch (code) {
    case 'high': return 'border-red-300';
    case 'medium': return 'border-yellow-300';
    case 'low': return 'border-green-300';
    default: return 'border-gray-300';
  }
}

// Clear cache when needed (e.g., when DB is updated)
export const clearPriorityCache = () => {
  priorityCache = null;
};