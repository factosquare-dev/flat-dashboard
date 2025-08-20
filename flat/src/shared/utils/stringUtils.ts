/**
 * String manipulation and formatting utilities
 */

/**
 * Truncate a string to a specified length with ellipsis
 */
export const truncate = (str: string, maxLength: number, suffix = '...'): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Convert camelCase to kebab-case
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Convert kebab-case to camelCase
 */
export const kebabToCamel = (str: string): string => {
  return str.replace(/-./g, match => match[1].toUpperCase());
};

/**
 * Remove special characters from string
 */
export const removeSpecialChars = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9가-힣\s]/g, '');
};

/**
 * Format phone number (Korean format)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Format business registration number (Korean format)
 */
export const formatBusinessNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  return number;
};

/**
 * Get initials from name
 */
export const getInitials = (name: string, maxLength = 2): string => {
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    // For single word names, return first characters
    return name.substring(0, maxLength).toUpperCase();
  }
  
  // For multiple words, get first letter of each word
  return parts
    .slice(0, maxLength)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

/**
 * Slugify a string (make URL-friendly)
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Highlight text within a string
 */
export const highlightText = (
  text: string,
  searchTerm: string,
  highlightClass = 'highlight'
): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
};

/**
 * Remove HTML tags from string
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Convert newlines to <br> tags
 */
export const nl2br = (str: string): string => {
  return str.replace(/\n/g, '<br />');
};

/**
 * Mask sensitive information
 */
export const maskString = (
  str: string,
  visibleStart = 3,
  visibleEnd = 4,
  maskChar = '*'
): string => {
  if (str.length <= visibleStart + visibleEnd) {
    return str;
  }
  
  const start = str.substring(0, visibleStart);
  const end = str.substring(str.length - visibleEnd);
  const maskLength = str.length - visibleStart - visibleEnd;
  const mask = maskChar.repeat(maskLength);
  
  return `${start}${mask}${end}`;
};

/**
 * Generate random string
 */
export const generateRandomString = (
  length: number,
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Extract mentions from text (e.g., @username)
 */
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};