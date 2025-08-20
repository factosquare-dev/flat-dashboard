// Common utility classes for frequent patterns
export const UTILITY_CLASSES = {
  // Layout utilities
  LAYOUT: {
    FLEX_CENTER: 'flex items-center justify-center',
    FLEX_BETWEEN: 'flex items-center justify-between',
    FLEX_COL_CENTER: 'flex flex-col items-center justify-center',
    GRID_CENTER: 'grid place-items-center',
    ABSOLUTE_CENTER: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  },

  // Spacing utilities
  SPACING: {
    SECTION: 'py-8 px-4',
    CONTAINER: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
    CARD_PADDING: 'p-6',
    FORM_SPACING: 'space-y-4',
  },

  // Border utilities
  BORDER: {
    SUBTLE: 'border border-gray-200',
    CARD: 'border border-gray-200 rounded-lg',
    ROUNDED_FULL: 'rounded-full',
    DIVIDER_Y: 'border-r border-gray-200',
    DIVIDER_X: 'border-b border-gray-200',
  },

  // Shadow utilities
  SHADOW: {
    CARD: 'shadow-sm hover:shadow-md transition-shadow',
    MODAL: 'shadow-xl',
    DROPDOWN: 'shadow-lg',
  },

  // Animation utilities
  ANIMATION: {
    FADE_IN: 'animate-fade-in',
    SLIDE_UP: 'animate-slide-up',
    SPIN: 'animate-spin',
    BOUNCE: 'animate-bounce',
    TRANSITION_ALL: 'transition-all duration-200 ease-in-out',
    TRANSITION_COLORS: 'transition-colors duration-200',
  },

  // State utilities
  STATE: {
    LOADING: 'opacity-50 pointer-events-none',
    DISABLED: 'opacity-50 cursor-not-allowed',
    ACTIVE: 'bg-blue-50 text-blue-700 border-blue-300',
    HOVER: 'hover:bg-gray-50 hover:text-gray-900',
  },

  // Typography utilities
  TEXT: {
    HEADING_LG: 'text-2xl font-bold text-gray-900',
    HEADING_MD: 'text-xl font-semibold text-gray-900',
    HEADING_SM: 'text-lg font-medium text-gray-900',
    BODY: 'text-sm text-gray-700',
    CAPTION: 'text-xs text-gray-500',
    LINK: 'text-blue-600 hover:text-blue-800 underline',
  },

  // Interactive utilities
  INTERACTIVE: {
    CLICKABLE: 'cursor-pointer select-none',
    BUTTON_FOCUS: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    INPUT_FOCUS: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  },
} as const;

// Color palette constants
export const COLORS = {
  PRIMARY: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
  },
  GRAY: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    900: 'bg-gray-900',
  },
  SUCCESS: {
    50: 'bg-green-50',
    500: 'bg-green-500',
    600: 'bg-green-600',
  },
  WARNING: {
    50: 'bg-yellow-50',
    500: 'bg-yellow-500',
    600: 'bg-yellow-600',
  },
  ERROR: {
    50: 'bg-red-50',
    500: 'bg-red-500',
    600: 'bg-red-600',
  },
} as const;