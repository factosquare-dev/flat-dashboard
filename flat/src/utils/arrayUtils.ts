/**
 * Array manipulation and helper utilities
 */

/**
 * Remove duplicates from array
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Remove duplicates by property
 */
export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Group array items by key
 */
export const groupBy = <T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Sort array by multiple properties
 */
export const sortBy = <T>(
  array: T[],
  ...keys: Array<keyof T | ((item: T) => any)>
): T[] => {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      const aValue = typeof key === 'function' ? key(a) : a[key];
      const bValue = typeof key === 'function' ? key(b) : b[key];
      
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
    }
    return 0;
  });
};

/**
 * Chunk array into smaller arrays
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Flatten nested array
 */
export const flatten = <T>(array: any[]): T[] => {
  return array.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
};

/**
 * Get difference between two arrays
 */
export const difference = <T>(array1: T[], array2: T[]): T[] => {
  const set2 = new Set(array2);
  return array1.filter(item => !set2.has(item));
};

/**
 * Get intersection of two arrays
 */
export const intersection = <T>(array1: T[], array2: T[]): T[] => {
  const set2 = new Set(array2);
  return array1.filter(item => set2.has(item));
};

/**
 * Move item in array from one index to another
 */
export const moveItem = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const newArray = [...array];
  const [removed] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, removed);
  return newArray;
};

/**
 * Toggle item in array
 */
export const toggleItem = <T>(array: T[], item: T): T[] => {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array, item];
  }
  return array.filter((_, i) => i !== index);
};

/**
 * Get random item from array
 */
export const randomItem = <T>(array: T[]): T | undefined => {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array
 */
export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Get last n items from array
 */
export const last = <T>(array: T[], n = 1): T[] => {
  return array.slice(-n);
};

/**
 * Get first n items from array
 */
export const first = <T>(array: T[], n = 1): T[] => {
  return array.slice(0, n);
};

/**
 * Count occurrences of items in array
 */
export const countBy = <T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, number> => {
  return array.reduce((counts, item) => {
    const countKey = typeof key === 'function' ? key(item) : String(item[key]);
    counts[countKey] = (counts[countKey] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
};

/**
 * Find item and its index
 */
export const findWithIndex = <T>(
  array: T[],
  predicate: (item: T) => boolean
): [T | undefined, number] => {
  const index = array.findIndex(predicate);
  return [index !== -1 ? array[index] : undefined, index];
};

/**
 * Create array of numbers in range
 */
export const range = (start: number, end: number, step = 1): number[] => {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
};