/**
 * Input Component
 *
 * Based on: GLEC-Design-System-Standards.md
 * Features: Label, Error, Helper text, Required indicator
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      isRequired = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {label}
            {isRequired && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={cn(
            `
              w-full px-4 py-2
              text-base text-gray-900
              border rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-gray-100 disabled:cursor-not-allowed
              placeholder:text-gray-400
            `,
            error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-error-500">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
