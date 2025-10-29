import { jsx, jsxs } from 'react/jsx-runtime';
import { cn } from '../utils/cn.mjs';

export function PageHeader({ title, subtitle, breadcrumb, actions, className, children }) {
  return jsxs('div', {
    className: cn('flex flex-col gap-6 border-b border-border pb-6', className),
    children: [
      jsxs('div', {
        className: 'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
        children: [
          jsxs('div', {
            className: 'space-y-2',
            children: [
              breadcrumb ? jsx('div', { className: 'text-xs font-medium uppercase tracking-wide text-muted-foreground', children: breadcrumb }) : null,
              jsxs('div', {
                children: [
                  jsx('h1', { className: 'text-2xl font-semibold text-foreground md:text-3xl', children: title }),
                  subtitle ? jsx('p', { className: 'mt-1 text-sm text-muted-foreground md:text-base', children: subtitle }) : null
                ]
              })
            ]
          }),
          actions || null
        ]
      }),
      children || null
    ]
  });
}

export function PageActions({ children, className }) {
  return jsx('div', { className: cn('flex flex-wrap items-center gap-2', className), children });
}
