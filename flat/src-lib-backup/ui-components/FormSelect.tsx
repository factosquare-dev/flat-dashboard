import React, { useMemo } from 'react';
import { APP_CONSTANTS } from '../config/constants';
import { inputStyles, cn } from '../utils/styleUtils';
import { generateAriaId } from '../utils/accessibility';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const FormSelect: React.FC<FormSelectProps> = React.memo(({
  label,
  error,
  helperText,
  options,
  placeholder = APP_CONSTANTS.TEXT.COMMON.SELECT,
  className = '',
  required,
  id,
  ...props
}) => {
  const selectId = id || generateAriaId('select');
  const errorId = error ? `${selectId}-error` : undefined;
  const helpId = helperText ? `${selectId}-help` : undefined;
  
  const selectStyle = useMemo(() => ({
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1.5rem 1.5rem',
    paddingRight: '2.5rem',
    maxHeight: `${APP_CONSTANTS.DIMENSIONS.DROPDOWN_MAX_HEIGHT}px`
  }), []);
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId}
          className={cn(
            COMPONENT_STYLES.LABEL.BASE,
            required && COMPONENT_STYLES.LABEL.REQUIRED
          )}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          COMPONENT_STYLES.INPUT.BASE,
          error ? COMPONENT_STYLES.INPUT.STATE.ERROR : COMPONENT_STYLES.INPUT.STATE.DEFAULT,
          'appearance-none bg-white bg-no-repeat bg-right',
          className
        )}
        style={selectStyle}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={cn(errorId, helpId).trim() || undefined}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className={COMPONENT_STYLES.TEXT.ERROR} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helpId} className={COMPONENT_STYLES.TEXT.HELPER}>
          {helperText}
        </p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;