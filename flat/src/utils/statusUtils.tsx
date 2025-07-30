import React from 'react';
import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import { ProjectStatus, TaskStatus } from '../types/enums';

export interface StatusInfo {
  code: string;
  displayName: string;
  color?: string;
  type: 'project' | 'task';
}

// Cache for status mappings
let statusCache: Map<string, StatusInfo> | null = null;

// Get status info from DB
export const getStatusInfo = (status: string, type: 'project' | 'task' = 'project'): StatusInfo => {
  // Initialize cache if needed
  if (!statusCache) {
    statusCache = new Map();
    
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      
      Array.from(database.statusMappings.values()).forEach(sm => {
        const info: StatusInfo = {
          code: sm.code,
          displayName: sm.displayName,
          color: sm.color,
          type: sm.type
        };
        
        // Store by type-code and type-displayName for easy lookup
        statusCache!.set(`${sm.type}-${sm.code}`, info);
        statusCache!.set(`${sm.type}-${sm.displayName}`, info);
      });
    } catch (error) {
      console.error('[getStatusInfo] Error loading status mappings:', error);
    }
  }
  
  // Try to find with type prefix first
  const withType = statusCache.get(`${type}-${status}`);
  if (withType) return withType;
  
  // Try without type prefix (backward compatibility)
  const anyType = Array.from(statusCache.values()).find(
    info => info.code === status || info.displayName === status
  );
  
  // Return found info or default
  return anyType || {
    code: status,
    displayName: status,
    color: '#6B7280',
    type: type
  };
};

// Get status display name
export const getStatusDisplayName = (status: string, type: 'project' | 'task' = 'project'): string => {
  return getStatusInfo(status, type).displayName;
};

// Get status style classes
export const getStatusStyles = (status: string, type: 'project' | 'task' = 'project', isSelected: boolean = false): string => {
  const info = getStatusInfo(status, type);
  return getStatusStylesByCode(info.code, isSelected);
};

// Get status icon
export const getStatusIcon = (status: string, type: 'project' | 'task' = 'project') => {
  const info = getStatusInfo(status, type);
  const upperCode = info.code.toUpperCase();
  
  // Use enum values for comparison
  if (upperCode === ProjectStatus.PLANNING || upperCode === TaskStatus.PENDING) {
    return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  
  if (upperCode === ProjectStatus.IN_PROGRESS || upperCode === TaskStatus.IN_PROGRESS) {
    return (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
      </svg>
    );
  }
  
  if (upperCode === ProjectStatus.COMPLETED || upperCode === TaskStatus.COMPLETED) {
    return (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  }
  
  if (upperCode === ProjectStatus.CANCELLED || upperCode === TaskStatus.CANCELLED) {
    return (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  }
  
  return null;
};

// Get all statuses by type
export const getAllStatuses = (type: 'project' | 'task' = 'project'): StatusInfo[] => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    return Array.from(database.statusMappings.values())
      .filter(sm => sm.type === type)
      .sort((a, b) => a.order - b.order)
      .map(sm => ({
        code: sm.code,
        displayName: sm.displayName,
        color: sm.color,
        type: sm.type
      }));
  } catch (error) {
    console.error('[getAllStatuses] Error:', error);
    return [];
  }
};

// Get status color
export const getStatusColor = (status: string, type: 'project' | 'task' = 'project'): string => {
  const info = getStatusInfo(status, type);
  return info.color || getStatusColorByCode(info.code);
};

// Get background color class
export const getStatusBgClass = (status: string, type: 'project' | 'task' = 'project'): string => {
  const info = getStatusInfo(status, type);
  return getStatusBgClassByCode(info.code);
};

// Get text color class
export const getStatusTextClass = (status: string, type: 'project' | 'task' = 'project'): string => {
  const info = getStatusInfo(status, type);
  return getStatusTextClassByCode(info.code);
};

// Get border color class
export const getStatusBorderClass = (status: string, type: 'project' | 'task' = 'project'): string => {
  const info = getStatusInfo(status, type);
  return getStatusBorderClassByCode(info.code);
};

// Private helper functions
function getStatusStylesByCode(code: string, isSelected: boolean = false): string {
  if (isSelected) {
    return getSelectedStatusStylesByCode(code);
  }
  const bgClass = getStatusBgClassByCode(code);
  const textClass = getStatusTextClassByCode(code);
  const borderClass = getStatusBorderClassByCode(code);
  return `${bgClass} ${textClass} ${borderClass}`;
}

function getStatusColorByCode(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (upperCode === ProjectStatus.PLANNING || upperCode === TaskStatus.PENDING) {
    return '#6B7280'; // gray-500
  }
  if (upperCode === ProjectStatus.IN_PROGRESS || upperCode === TaskStatus.IN_PROGRESS) {
    return '#3B82F6'; // blue-500
  }
  if (upperCode === ProjectStatus.COMPLETED || upperCode === TaskStatus.COMPLETED) {
    return '#10B981'; // green-500
  }
  if (upperCode === ProjectStatus.CANCELLED || upperCode === TaskStatus.CANCELLED) {
    return '#EF4444'; // red-500
  }
  
  return '#6B7280'; // default gray
}

function getStatusBgClassByCode(code: string): string {
  if (!code) {
    console.warn('[getStatusBgClassByCode] Status code is undefined');
    return 'bg-gray-100';
  }
  const upperCode = code.toUpperCase();
  
  if (upperCode === ProjectStatus.PLANNING || upperCode === TaskStatus.PENDING) {
    return 'bg-gray-100';
  }
  if (upperCode === ProjectStatus.IN_PROGRESS || upperCode === TaskStatus.IN_PROGRESS) {
    return 'bg-blue-100';
  }
  if (upperCode === ProjectStatus.COMPLETED || upperCode === TaskStatus.COMPLETED) {
    return 'bg-green-100';
  }
  if (upperCode === ProjectStatus.CANCELLED || upperCode === TaskStatus.CANCELLED) {
    return 'bg-red-100';
  }
  
  return 'bg-gray-100'; // default
}

function getStatusTextClassByCode(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (upperCode === ProjectStatus.PLANNING || upperCode === TaskStatus.PENDING) {
    return 'text-gray-700';
  }
  if (upperCode === ProjectStatus.IN_PROGRESS || upperCode === TaskStatus.IN_PROGRESS) {
    return 'text-blue-700';
  }
  if (upperCode === ProjectStatus.COMPLETED || upperCode === TaskStatus.COMPLETED) {
    return 'text-green-700';
  }
  if (upperCode === ProjectStatus.CANCELLED || upperCode === TaskStatus.CANCELLED) {
    return 'text-red-700';
  }
  
  return 'text-gray-700'; // default
}

function getStatusBorderClassByCode(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (upperCode === ProjectStatus.PLANNING || upperCode === TaskStatus.PENDING) {
    return 'border-gray-300';
  }
  if (upperCode === ProjectStatus.IN_PROGRESS || upperCode === TaskStatus.IN_PROGRESS) {
    return 'border-blue-300';
  }
  if (upperCode === ProjectStatus.COMPLETED || upperCode === TaskStatus.COMPLETED) {
    return 'border-green-300';
  }
  if (upperCode === ProjectStatus.CANCELLED || upperCode === TaskStatus.CANCELLED) {
    return 'border-red-300';
  }
  
  return 'border-gray-300'; // default
}

function getSelectedStatusStylesByCode(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (upperCode === ProjectStatus.PLANNING || upperCode === TaskStatus.PENDING) {
    return 'bg-gray-600 text-white border-gray-700';
  }
  if (upperCode === ProjectStatus.IN_PROGRESS || upperCode === TaskStatus.IN_PROGRESS) {
    return 'bg-blue-600 text-white border-blue-700';
  }
  if (upperCode === ProjectStatus.COMPLETED || upperCode === TaskStatus.COMPLETED) {
    return 'bg-green-600 text-white border-green-700';
  }
  if (upperCode === ProjectStatus.CANCELLED || upperCode === TaskStatus.CANCELLED) {
    return 'bg-red-600 text-white border-red-700';
  }
  
  return 'bg-gray-600 text-white border-gray-700'; // default
}

// Clear cache when needed
export const clearStatusCache = () => {
  statusCache = null;
};