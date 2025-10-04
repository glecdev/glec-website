/**
 * Select Component
 *
 * Based on: GLEC-Design-System-Standards.md
 * Features: Label, Error, Options, Required indicator
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  isRequired?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      isRequired = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {label}
            {isRequired && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={cn(
            `
              w-full px-4 py-2
              text-base text-gray-900
              border rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-gray-100 disabled:cursor-not-allowed
            `,
            error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-sm text-error-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
