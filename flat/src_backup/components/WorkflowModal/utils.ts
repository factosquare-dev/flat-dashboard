import { COLOR_LIGHT_CLASS_MAP, COLOR_DOT_CLASS_MAP } from './constants';

export const getLightColorClass = (color: string): string => {
  return COLOR_LIGHT_CLASS_MAP[color] || 'bg-gray-50 border-gray-200 hover:border-gray-400';
};

export const getDotColorClass = (color: string): string => {
  return COLOR_DOT_CLASS_MAP[color] || 'bg-gray-500';
};