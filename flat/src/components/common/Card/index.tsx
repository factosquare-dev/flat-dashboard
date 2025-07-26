import React from 'react';
import { cn } from '@/utils/classNames';
import styles from './Card.module.css';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardShadow = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  shadow?: CardShadow;
  hoverable?: boolean;
  loading?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  compact?: boolean;
  action?: React.ReactNode;
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

// Main Card component
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, padding = 'md', shadow = 'none', hoverable = false, loading = false, ...props }, ref) => {
    const paddingClass = padding !== 'none' ? styles[`padding${capitalize(padding)}`] : '';
    const shadowClass = shadow !== 'none' ? styles[`shadow${capitalize(shadow)}`] : '';

    return (
      <div
        ref={ref}
        className={cn(
          styles.card,
          paddingClass,
          shadowClass,
          hoverable && styles.hoverable,
          loading && styles.loading,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Card Header component
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, compact = false, action, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(compact ? styles.headerCompact : styles.header, className)}
        {...props}
      >
        {children || (
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className={styles.title}>{title}</h3>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
      </div>
    );
  }
);

// Card Body component
const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ compact = false, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(compact ? styles.bodyCompact : styles.body, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Card Footer component
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ compact = false, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(compact ? styles.footerCompact : styles.footer, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Card Image component
const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ containerClassName, className, alt = '', ...props }, ref) => {
    return (
      <div className={cn(styles.imageContainer, containerClassName)}>
        <img
          ref={ref}
          alt={alt}
          className={cn(styles.image, className)}
          {...props}
        />
      </div>
    );
  }
);

// Helper function
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Display names
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';
CardImage.displayName = 'CardImage';

// Export compound component
export default Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Image: CardImage,
});