import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/classNames';
import { BadgeVariant, BadgeSize, BadgeShape, BadgeStyle } from '@/shared/types/enums';
import styles from './Badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  style?: BadgeStyle;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      className,
      variant = BadgeVariant.DEFAULT,
      size = BadgeSize.SM,
      shape = BadgeShape.ROUNDED,
      style = BadgeStyle.LIGHT,
      dot = false,
      removable = false,
      onRemove,
      ...props
    },
    ref
  ) => {
    const getVariantClass = () => {
      const variantStr = variant.toLowerCase();
      if (style === BadgeStyle.SOLID) {
        return styles[`solid${capitalize(variantStr)}`];
      } else if (style === BadgeStyle.OUTLINE) {
        return styles[`outline${capitalize(variantStr)}`];
      }
      return styles[variantStr];
    };

    return (
      <span
        ref={ref}
        className={cn(
          styles.badge,
          styles[size.toLowerCase()],
          getVariantClass(),
          styles[shape.toLowerCase()],
          removable && styles.removable,
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              styles.dot,
              styles[`dot${capitalize(variant.toLowerCase())}`]
            )}
          />
        )}
        {children}
        {removable && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={styles.removeButton}
            aria-label="Remove"
          >
            <X className={styles.removeIcon} />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Helper function
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default Badge;