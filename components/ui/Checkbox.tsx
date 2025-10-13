/**
 * Checkbox Component
 *
 * Based on: GLEC-Design-System-Standards.md (Form inputs)
 * Purpose: Reusable checkbox input with label
 */

'use client';

import React from 'react';

export interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  error?: string;
  disabled?: boolean;
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  error,
  disabled = false,
}: CheckboxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={`
            mt-0.5 h-5 w-5 rounded border-2 text-primary-600
            focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        <label
          htmlFor={id}
          className={`
            text-sm leading-relaxed select-none
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${error ? 'text-red-700' : 'text-gray-700'}
          `}
        >
          {label}
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-600 ml-8">{error}</p>
      )}
    </div>
  );
}
