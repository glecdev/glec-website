/**
 * Textarea Component
 *
 * Based on: GLEC-Design-System-Standards.md
 * Features: Label, Error, Helper text, Required indicator, Character count
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  showCharCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      isRequired = false,
      showCharCount = false,
      maxLength,
      className,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    const charCount = value ? String(value).length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {label}
            {isRequired && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            `
              w-full px-4 py-2
              text-base text-gray-900
              border rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-gray-100 disabled:cursor-not-allowed
              placeholder:text-gray-400
              resize-y
            `,
            error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          {...props}
        />

        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-error-500"
              >
                {error}
              </p>
            )}

            {!error && helperText && (
              <p
                id={`${textareaId}-helper`}
                className="text-sm text-gray-500"
              >
                {helperText}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <p
              className={cn(
                'text-sm ml-2',
                charCount > maxLength ? 'text-error-500' : 'text-gray-500'
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
