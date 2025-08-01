// UI Layout Constants
export const LAYOUT = {
  SIDEBAR_WIDTH: 48, // w-48 = 192px / 4 = 48
  CELL_HEIGHT: 10, // h-10 = 40px / 4 = 10
  CELL_WIDTH: 16, // w-16 = 64px / 4 = 16
  GANTT_HEADER_HEIGHT: 8, // h-8 = 32px / 4 = 8
} as const;

// Spacing Constants (Tailwind spacing scale)
export const SPACING = {
  XS: 1, // 4px
  SM: 2, // 8px
  MD: 4, // 16px
  LG: 6, // 24px
  XL: 8, // 32px
  XXL: 12, // 48px
} as const;

// Border Radius Constants
export const RADIUS = {
  SM: 'rounded',
  MD: 'rounded-md',
  LG: 'rounded-lg',
  XL: 'rounded-xl',
  FULL: 'rounded-full',
} as const;

// Animation Duration Constants
export const ANIMATION = {
  FAST: 'duration-150',
  NORMAL: 'duration-300',
  SLOW: 'duration-500',
} as const;