/**
 * Card Component
 *
 * Based on: GLEC-Design-System-Standards.md
 * Variants: default, elevated, outlined
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-lg transition-all duration-200', {
  variants: {
    variant: {
      default: 'bg-white',
      elevated: 'bg-white shadow-lg hover:shadow-xl',
      outlined: 'bg-white border-2 border-gray-200 hover:border-primary-500',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    hover: {
      true: 'hover:-translate-y-1 cursor-pointer',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
    hover: false,
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hover, className }))}
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
  <div ref={ref} className={cn('mb-4', className)} {...props} />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-bold text-gray-900', className)}
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
    className={cn('text-base text-gray-600 mt-2', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-6', className)} {...props} />
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
