/**
 * Centralized validation utilities
 */

// ============================================
// String Validators
// ============================================

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Korean)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) || (cleaned.length === 10 || cleaned.length === 11);
}

/**
 * Validate business registration number (Korean)
 */
export function isValidBusinessNumber(number: string): boolean {
  const cleaned = number.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return false;
  }
  
  // Korean business number validation algorithm
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }
  
  sum += Math.floor((parseInt(cleaned[8]) * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return checkDigit === parseInt(cleaned[9]);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Number Validators
// ============================================

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Check if number is in range
 */
export function isInRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Check if value is positive
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Check if value is non-negative
 */
export function isNonNegative(value: number): boolean {
  return value >= 0;
}

// ============================================
// Date Validators
// ============================================

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Check if date is within range
 */
export function isDateInRange(
  date: Date | string,
  startDate?: Date | string,
  endDate?: Date | string
): boolean {
  const target = typeof date === 'string' ? new Date(date) : date;
  
  if (startDate) {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    if (target < start) return false;
  }
  
  if (endDate) {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    if (target > end) return false;
  }
  
  return true;
}

// ============================================
// Form Validators
// ============================================

/**
 * Validate required field
 */
export function isRequired(value: any, message = '필수 입력 항목입니다'): string | null {
  return isEmpty(value) ? message : null;
}

/**
 * Validate minimum length
 */
export function minLength(min: number, message?: string) {
  return (value: string): string | null => {
    if (!value || value.length < min) {
      return message || `최소 ${min}자 이상 입력해주세요`;
    }
    return null;
  };
}

/**
 * Validate maximum length
 */
export function maxLength(max: number, message?: string) {
  return (value: string): string | null => {
    if (value && value.length > max) {
      return message || `최대 ${max}자까지 입력 가능합니다`;
    }
    return null;
  };
}

/**
 * Validate pattern
 */
export function pattern(regex: RegExp, message = '올바른 형식이 아닙니다') {
  return (value: string): string | null => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  };
}

// ============================================
// Composite Validators
// ============================================

/**
 * Combine multiple validators
 */
export function compose(...validators: Array<(value: any) => string | null>) {
  return (value: any): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

/**
 * Validate form data
 */
export interface ValidationRule {
  field: string;
  validators: Array<(value: any) => string | null>;
}

export function validateForm(
  data: Record<string, any>,
  rules: ValidationRule[]
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const rule of rules) {
    const value = data[rule.field];
    
    for (const validator of rule.validators) {
      const error = validator(value);
      if (error) {
        errors[rule.field] = error;
        break;
      }
    }
  }
  
  return errors;
}

// ============================================
// Password Validators
// ============================================

/**
 * Validate password strength
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('비밀번호는 8자 이상이어야 합니다');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('대문자를 포함해주세요');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('소문자를 포함해주세요');
  }
  
  // Number check
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('숫자를 포함해주세요');
  }
  
  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push('특수문자를 포함해주세요');
  }
  
  return { score: Math.min(score, 4), feedback };
}

/**
 * Validate password match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}