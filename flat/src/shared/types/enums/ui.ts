/**
 * UI Component related enums
 */

// Table Column IDs (데이터 컬럼만 포함, checkbox와 options는 제외)
export enum TableColumnId {
  NAME = 'name',
  LAB_NUMBER = 'labNumber',
  MEMO = 'memo',
  PRODUCT_TYPE = 'productType',
  CLIENT = 'client',
  SERVICE_TYPE = 'serviceType',
  CURRENT_STAGE = 'currentStage',
  STATUS = 'status',
  PROGRESS = 'progress',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  MANUFACTURER = 'manufacturer',
  CONTAINER = 'container',
  PACKAGING = 'packaging',
  SALES = 'sales',
  PURCHASE = 'purchase',
  DEPOSIT_PAID = 'depositPaid',
  PRIORITY = 'priority',
}

// Badge Variants
export enum BadgeVariant {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

// Button Variants
export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  OUTLINE = 'outline',
  GHOST = 'ghost',
  DANGER = 'danger',
}

// Button Sizes
export enum ButtonSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

// Badge Sizes
export enum BadgeSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

// Badge Shapes
export enum BadgeShape {
  ROUNDED = 'rounded',
  SQUARE = 'square',
  PILL = 'pill',
}

// Badge Styles
export enum BadgeStyle {
  SOLID = 'solid',
  OUTLINE = 'outline',
  SUBTLE = 'subtle',
}

// Component Size (generic)
export enum ComponentSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

// Size enum (for backward compatibility)
export enum Size {
  XS = 'XS',
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
  XL = 'XL',
  XXL = 'XXL',
}

// Gap Size for spacing
export enum GapSize {
  NONE = 'none',
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

// Toast Variants
export enum ToastVariant {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

// Card Variants
export enum CardVariant {
  DEFAULT = 'default',
  ELEVATED = 'elevated',
  OUTLINED = 'outlined',
  FILLED = 'filled',
}

// Card Padding
export enum CardPadding {
  NONE = 'none',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

// Modal Variants
export enum ModalVariant {
  DEFAULT = 'default',
  FULLSCREEN = 'fullscreen',
  SIDEBAR = 'sidebar',
}

// Modal Size
export enum ModalSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  FULL = 'full',
  AUTO = 'auto', // Content-based sizing
}

// Theme
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

// Language
export enum Language {
  KO = 'ko',
  EN = 'en',
  JA = 'ja',
  ZH = 'zh',
}

// Loading State
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Component State
export enum ComponentState {
  DEFAULT = 'default',
  HOVER = 'hover',
  ACTIVE = 'active',
  FOCUS = 'focus',
  DISABLED = 'disabled',
  LOADING = 'loading',
  ERROR = 'error',
}

// Validation Message Type
export enum ValidationMessageType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
}

// Validation Message Labels (Korean)
export const ValidationMessageTypeLabel: Record<ValidationMessageType, string> = {
  [ValidationMessageType.ERROR]: '오류',
  [ValidationMessageType.WARNING]: '경고',
  [ValidationMessageType.INFO]: '정보',
  [ValidationMessageType.SUCCESS]: '성공',
};

// Icon Size mapping
export const IconSizeMap: Record<ComponentSize, number> = {
  [ComponentSize.XS]: 12,
  [ComponentSize.SM]: 16,
  [ComponentSize.MD]: 20,
  [ComponentSize.LG]: 24,
  [ComponentSize.XL]: 32,
};

// Spacing mapping
export const SpacingMap: Record<GapSize, string> = {
  [GapSize.NONE]: '0',
  [GapSize.XS]: '0.25rem',
  [GapSize.SM]: '0.5rem',
  [GapSize.MD]: '1rem',
  [GapSize.LG]: '1.5rem',
  [GapSize.XL]: '2rem',
};