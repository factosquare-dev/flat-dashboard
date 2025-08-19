import { ModalSize } from '@/types/enums';

/**
 * Convert ModalSize enum to string format for BaseModal
 * Ensures type safety while maintaining component compatibility
 */
export const getModalSizeString = (size: ModalSize): 'sm' | 'md' | 'lg' | 'xl' => {
  return size.toLowerCase() as 'sm' | 'md' | 'lg' | 'xl';
};

/**
 * Get default modal size based on content type
 */
export const getDefaultModalSize = (contentType: 'form' | 'list' | 'detail' | 'full'): ModalSize => {
  switch (contentType) {
    case 'form':
      return ModalSize.MD;
    case 'list':
      return ModalSize.LG;
    case 'detail':
      return ModalSize.XL;
    case 'full':
      return ModalSize.XL;
    default:
      return ModalSize.MD;
  }
};

/**
 * Modal size utility constants
 */
export const MODAL_SIZES = {
  SMALL: getModalSizeString(ModalSize.SM),
  MEDIUM: getModalSizeString(ModalSize.MD),
  LARGE: getModalSizeString(ModalSize.LG),
  EXTRA_LARGE: getModalSizeString(ModalSize.XL),
} as const;