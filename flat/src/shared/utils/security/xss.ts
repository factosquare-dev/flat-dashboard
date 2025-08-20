import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string, options?: Config): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'span', 'div', 'a'],
    ALLOWED_ATTR: ['href', 'class', 'id', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...options
  });
}

/**
 * Sanitize user input for display
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  
  // Basic HTML entity encoding
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  const sanitized = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  
  if (dangerousProtocols.some(protocol => sanitized.startsWith(protocol))) {
    return '';
  }
  
  // Ensure URL starts with safe protocol
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://') && !sanitized.startsWith('//')) {
    return `https://${url}`;
  }
  
  return url;
}

/**
 * Create a Content Security Policy header
 */
export function generateCSP(nonce?: string): string {
  const policies = [
    "default-src 'self'",
    `script-src 'self' ${nonce ? `'nonce-${nonce}'` : "'unsafe-inline'"} https://apis.google.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.example.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ];
  
  return policies.join('; ');
}

/**
 * Validate and sanitize JSON data
 */
export function sanitizeJSON(data: any): any {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeJSON(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize key as well
      const sanitizedKey = sanitizeText(key);
      sanitized[sanitizedKey] = sanitizeJSON(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Safe innerHTML setter using DOMPurify
 */
export function setInnerHTML(element: HTMLElement, html: string): void {
  element.innerHTML = sanitizeHtml(html);
}

