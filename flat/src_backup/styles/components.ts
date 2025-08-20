// Standardized Tailwind CSS classes for consistent component styling
export const COMPONENT_STYLES = {
  // Button variants
  BUTTON: {
    BASE: 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    SIZE: {
      SM: 'h-8 px-3 text-sm rounded-md',
      MD: 'h-10 px-4 py-2 text-sm rounded-md',
      LG: 'h-12 px-6 py-3 text-base rounded-lg',
    },
    VARIANT: {
      PRIMARY: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      SECONDARY: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      OUTLINE: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
      GHOST: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      DANGER: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    },
  },

  // Form Input styles
  INPUT: {
    BASE: 'w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
    STATE: {
      DEFAULT: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
      ERROR: 'border-red-300 focus:ring-red-500 focus:border-red-500',
      SUCCESS: 'border-green-300 focus:ring-green-500 focus:border-green-500',
      DISABLED: 'bg-gray-50 text-gray-500 cursor-not-allowed',
    },
  },

  // Form Label styles
  LABEL: {
    BASE: 'block text-sm font-medium text-gray-700 mb-1.5',
    REQUIRED: 'after:content-["*"] after:text-red-500 after:ml-1',
  },

  // Form Error and Helper text
  TEXT: {
    ERROR: 'mt-1 text-xs text-red-600',
    HELPER: 'mt-1 text-xs text-gray-500',
    SUCCESS: 'mt-1 text-xs text-green-600',
  },

  // Modal styles
  MODAL: {
    BACKDROP: 'fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4',
    CONTAINER: 'bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden',
    HEADER: 'px-6 py-4 border-b border-gray-200',
    TITLE: 'text-lg font-semibold text-gray-900',
    BODY: 'px-6 py-4 overflow-y-auto',
    FOOTER: 'px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3',
    SIZE: {
      SM: 'max-w-sm',
      MD: 'max-w-md',
      LG: 'max-w-lg',
      XL: 'max-w-xl',
      '2XL': 'max-w-2xl',
    },
  },

  // Card styles
  CARD: {
    BASE: 'bg-white rounded-lg border border-gray-200 shadow-sm',
    HEADER: 'px-6 py-4 border-b border-gray-200',
    BODY: 'px-6 py-4',
    FOOTER: 'px-6 py-4 bg-gray-50 border-t border-gray-200',
    HOVER: 'hover:shadow-md transition-shadow duration-200',
  },

  // Table styles
  TABLE: {
    CONTAINER: 'overflow-x-auto',
    BASE: 'min-w-full divide-y divide-gray-200',
    HEADER: 'bg-gray-50',
    HEADER_CELL: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    BODY: 'bg-white divide-y divide-gray-200',
    ROW: 'hover:bg-gray-50 transition-colors',
    CELL: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  },

  // Badge/Tag styles
  BADGE: {
    BASE: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    VARIANT: {
      DEFAULT: 'bg-gray-100 text-gray-800',
      PRIMARY: 'bg-blue-100 text-blue-800',
      SUCCESS: 'bg-green-100 text-green-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      DANGER: 'bg-red-100 text-red-800',
      INFO: 'bg-cyan-100 text-cyan-800',
    },
  },

  // Alert styles
  ALERT: {
    BASE: 'p-4 rounded-lg',
    VARIANT: {
      INFO: 'bg-blue-50 text-blue-800 border border-blue-200',
      SUCCESS: 'bg-green-50 text-green-800 border border-green-200',
      WARNING: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
      ERROR: 'bg-red-50 text-red-800 border border-red-200',
    },
  },

  // Loading states
  LOADING: {
    SPINNER: 'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
    SKELETON: 'animate-pulse bg-gray-200 rounded',
    SHIMMER: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
  },

  // Layout utilities
  LAYOUT: {
    CONTAINER: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    SECTION: 'py-8',
    GRID: {
      COLS_1: 'grid grid-cols-1 gap-6',
      COLS_2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
      COLS_3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      COLS_4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
    },
    FLEX: {
      CENTER: 'flex items-center justify-center',
      BETWEEN: 'flex items-center justify-between',
      START: 'flex items-start',
      END: 'flex items-end',
    },
  },

  // Transition utilities
  TRANSITION: {
    DEFAULT: 'transition-all duration-200 ease-in-out',
    FAST: 'transition-all duration-150 ease-in-out',
    SLOW: 'transition-all duration-300 ease-in-out',
    COLORS: 'transition-colors duration-200',
    TRANSFORM: 'transition-transform duration-200',
  },
} as const;

// Utility function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Common component class builders
export const buildButtonClass = (
  variant: keyof typeof COMPONENT_STYLES.BUTTON.VARIANT = 'PRIMARY',
  size: keyof typeof COMPONENT_STYLES.BUTTON.SIZE = 'MD'
): string => {
  return cn(
    COMPONENT_STYLES.BUTTON.BASE,
    COMPONENT_STYLES.BUTTON.SIZE[size],
    COMPONENT_STYLES.BUTTON.VARIANT[variant]
  );
};

export const buildInputClass = (
  state: keyof typeof COMPONENT_STYLES.INPUT.STATE = 'DEFAULT'
): string => {
  return cn(
    COMPONENT_STYLES.INPUT.BASE,
    COMPONENT_STYLES.INPUT.STATE[state]
  );
};

export const buildModalClass = (
  size: keyof typeof COMPONENT_STYLES.MODAL.SIZE = 'MD'
): string => {
  return cn(
    COMPONENT_STYLES.MODAL.CONTAINER,
    COMPONENT_STYLES.MODAL.SIZE[size]
  );
};

export const buildBadgeClass = (
  variant: keyof typeof COMPONENT_STYLES.BADGE.VARIANT = 'DEFAULT'
): string => {
  return cn(
    COMPONENT_STYLES.BADGE.BASE,
    COMPONENT_STYLES.BADGE.VARIANT[variant]
  );
};