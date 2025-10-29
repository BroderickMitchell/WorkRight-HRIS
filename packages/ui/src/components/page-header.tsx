import { ReactNode } from 'react';
import { cn } from '../utils/cn';

/**
 * Composable page header with breadcrumb and action slots.
 */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className, children }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-6 border-b border-border pb-6', className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          {breadcrumb ? <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{breadcrumb}</div> : null}
          <div>
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground md:text-base">{subtitle}</p> : null}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function PageActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>;
}
