import { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

/**
 * Compact status indicator.
 */
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary',
        className
      )}
      {...props}
    />
  );
}
