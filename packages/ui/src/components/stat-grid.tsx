import { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface StatGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  return (
    <div className={cn('grid gap-4', gridCols(columns), className)}>{children}</div>
  );
}

function gridCols(columns: number) {
  switch (columns) {
    case 2:
      return 'grid-cols-1 sm:grid-cols-2';
    case 3:
      return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3';
    default:
      return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';
  }
}
