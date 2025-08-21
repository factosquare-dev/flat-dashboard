import React from 'react';
import { sanitizeHtml } from '@/shared/utils/security/xss';

interface SafeHTMLProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

export const SafeHTML: React.FC<SafeHTMLProps> = ({ 
  html, 
  className,
  allowedTags,
  allowedAttributes 
}) => {
  const sanitized = sanitizeHtml(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes
  });
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};