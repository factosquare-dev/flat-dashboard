/**
 * Zustand Stores Export
 * 
 * Centralized state management using Zustand
 * Replacing Context API for better performance and DX
 */

// Main stores
export { useAppStore, useProjectsData, useModalStates, useProjectContext, useCustomerContext, useTaskContext } from './appStore';
export { useModalStore, useTypedModal } from './modalStore';

// Types
export type { ModalConfig, ModalConfigAny } from './modalStore';

// Migration utilities
export { 
  AppContextCompatibilityProvider, 
  ModalRenderer,
  useAppContext as useAppContextCompat,
  useModal as useModalCompat 
} from './migration/contextToZustand';