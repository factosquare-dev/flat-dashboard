/**
 * Common hooks export barrel
 */

// Modal management
export { useModalState, useMultipleModals } from './useModalState';
export type { UseModalStateReturn, ModalState } from './useModalState';

// Performance optimization
export { useDebounce } from './common/useDebounce';
export { useInfiniteScroll } from './useInfiniteScroll';

// Data management
export { useAsyncState } from './useAsyncState';
export { useColumnOrder } from './useColumnOrder';
export { useDragSelection } from './useDragSelection';
export { useEditableCell } from './useEditableCell';
export { useFactoryFilter } from './useFactoryFilter';
export { useGanttData } from './useGanttData';
export { useGanttDrag } from './useGanttDrag';
export { useProjectFilters } from './useProjectFilters';
export { useProjects } from './useProjects/index';
export { useScheduleDrag } from './useScheduleDrag';
export { useScheduleTasks } from './useScheduleTasks';
export { useToast } from './useToast';
export { useUserFilter } from './useUserFilter';
export { useUserManagement } from './useUserManagement';

// Query hooks
export * from './query';