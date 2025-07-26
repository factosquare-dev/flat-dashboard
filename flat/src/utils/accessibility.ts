// Accessibility utilities and helpers
export const ARIA_LABELS = {
  // Navigation
  MAIN_NAVIGATION: '주 탐색',
  BREADCRUMB: '브레드크럼',
  PAGINATION: '페이지네이션',
  
  // Buttons
  CLOSE_BUTTON: '닫기 버튼',
  SAVE_BUTTON: '저장 버튼',
  DELETE_BUTTON: '삭제 버튼',
  EDIT_BUTTON: '편집 버튼',
  ADD_BUTTON: '추가 버튼',
  SEARCH_BUTTON: '검색 버튼',
  
  // Modal
  MODAL_DIALOG: '대화상자',
  MODAL_TITLE: '대화상자 제목',
  MODAL_CLOSE: '대화상자 닫기',
  
  // Form
  REQUIRED_FIELD: '필수 입력 필드',
  OPTIONAL_FIELD: '선택 입력 필드',
  FORM_ERROR: '입력 오류',
  FORM_HELP: '입력 도움말',
  
  // Table
  TABLE_CAPTION: '데이터 테이블',
  SORT_ASCENDING: '오름차순 정렬',
  SORT_DESCENDING: '내림차순 정렬',
  ROW_SELECTED: '행 선택됨',
  
  // Status
  LOADING: '로딩 중',
  ERROR: '오류 발생',
  SUCCESS: '성공',
  WARNING: '경고',
  
  // Actions
  EXPAND: '펼치기',
  COLLAPSE: '접기',
  SHOW_MORE: '더 보기',
  SHOW_LESS: '간략히 보기',
} as const;

// Generate unique IDs for accessibility
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
};

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Focus management utilities
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.TAB) {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    return () => element.removeEventListener('keydown', handleTabKey);
  },

  // Set focus to first focusable element
  focusFirst: (element: HTMLElement) => {
    const firstFocusable = element.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();
  },

  // Restore focus to previously focused element
  restoreFocus: (previouslyFocused: HTMLElement | null) => {
    if (previouslyFocused && document.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
  },
};

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('class', 'sr-only');
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  // Create visually hidden text for screen readers
  createSROnlyText: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  },
};

// Color contrast and visibility helpers
export const accessibility = {
  // Check if element is visible
  isVisible: (element: HTMLElement): boolean => {
    return !!(
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  },

  // Get contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string): number => {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd convert colors to RGB and calculate luminance
    return 4.5; // Placeholder - should meet WCAG AA standards
  },

  // Validate form accessibility
  validateFormAccessibility: (form: HTMLFormElement) => {
    const issues: string[] = [];
    
    // Check for labels
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      form.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel) {
        issues.push(`Input missing label: ${input.tagName.toLowerCase()}`);
      }
    });

    // Check for required field indicators
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach((input) => {
      const hasRequiredIndicator = input.getAttribute('aria-required') === 'true';
      if (!hasRequiredIndicator) {
        issues.push(`Required field missing aria-required: ${input.id || input.tagName}`);
      }
    });

    return issues;
  },
};

// High contrast mode detection
export const highContrastMode = {
  isEnabled: (): boolean => {
    // Check for Windows High Contrast mode
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  onChange: (callback: (enabled: boolean) => void) => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  },
};

// Reduced motion preference
export const reducedMotion = {
  isEnabled: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  onChange: (callback: (enabled: boolean) => void) => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  },
};