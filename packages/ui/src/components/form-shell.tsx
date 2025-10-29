import { FormHTMLAttributes, ReactNode } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from './card';
import { cn } from '../utils/cn';

interface FormShellProps extends FormHTMLAttributes<HTMLFormElement> {
  title: string;
  description?: string;
  footer?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Opinionated form wrapper with sticky footer for actions.
 */
export function FormShell({ title, description, footer, actions, children, className, ...props }: FormShellProps) {
  return (
    <form className={cn('flex h-full flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {actions}
        </CardHeader>
        <div className="space-y-6">{children}</div>
      </Card>
      {footer ? (
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-border bg-panel/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-panel/80">
          {footer}
        </div>
      ) : null}
    </form>
  );
}
