/**
 * Button Component
 *
 * Based on: GLEC-Design-System-Standards.md
 * Variants: primary, secondary, outline, ghost, danger
 * Sizes: sm, md, lg
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  `
    inline-flex items-center justify-center
    font-semibold rounded-lg
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-primary-700 text-white
          hover:bg-primary-800 active:bg-primary-900
          focus-visible:ring-primary-500
        `,
        secondary: `
          bg-navy-900 text-white
          hover:bg-navy-800 active:bg-navy-700
          focus-visible:ring-navy-500
        `,
        outline: `
          border-2 border-primary-700 text-primary-700
          hover:bg-primary-50 active:bg-primary-100
          focus-visible:ring-primary-500
        `,
        ghost: `
          text-gray-700
          hover:bg-gray-100 active:bg-gray-200
          focus-visible:ring-gray-500
        `,
        danger: `
          bg-error-500 text-white
          hover:bg-error-600 active:bg-error-700
          focus-visible:ring-error-500
        `,
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    // Note: asChild prop is reserved for future Radix UI Slot integration
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
