/**
 * Utility function for conditionally joining classNames together
 * Similar to clsx or classnames library but lightweight
 */
export function cn(...inputs: (string | boolean | undefined | null | Record<string, boolean>)[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [className, condition] of Object.entries(input)) {
        if (condition) {
          classes.push(className);
        }
      }
    }
  }
  
  return classes.join(' ');
}

/**
 * Merge multiple className props
 */
export function mergeClasses(...classNames: (string | undefined)[]): string {
  return classNames.filter(Boolean).join(' ');
}