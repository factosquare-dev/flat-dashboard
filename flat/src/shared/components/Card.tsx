import React from 'react';
import { CardVariant, CardPadding } from '@/shared/types/enums';
import { cn } from '@/shared/utils/cn';
import './Card.css';

const variantClassMap = {
  [CardVariant.DEFAULT]: 'card--default',
  [CardVariant.ELEVATED]: 'card--elevated',
  [CardVariant.OUTLINE]: 'card--outline',
  [CardVariant.GHOST]: 'card--ghost',
};

const paddingClassMap = {
  [CardPadding.NONE]: 'card--padding-none',
  [CardPadding.SM]: 'card--padding-sm',
  [CardPadding.MD]: 'card--padding-md',
  [CardPadding.LG]: 'card--padding-lg',
};

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = CardVariant.DEFAULT, padding = CardPadding.MD, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card',
          variantClassMap[variant],
          paddingClassMap[padding],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('card-header', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('card-title', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('card-description', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('card-content', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('card-footer', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};