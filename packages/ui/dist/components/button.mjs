import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { jsx } from 'react/jsx-runtime';
import { cn } from '../utils/cn.mjs';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground border-transparent hover:bg-primary/90',
        secondary: 'border-border bg-panel text-foreground hover:bg-panel/80',
        ghost: 'border-transparent text-primary hover:bg-primary/10'
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export const Button = forwardRef(function Button({ className, variant, size, ...props }, ref) {
  return jsx('button', { ref, className: cn(buttonVariants({ variant, size }), className), ...props });
});

Button.displayName = 'Button';
