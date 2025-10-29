import { jsx, jsxs } from 'react/jsx-runtime';
import { cn } from '../utils/cn.mjs';

export function EmptyState({ icon, title, description, action, className }) {
  return jsxs('div', {
    className: cn('flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-panel p-8 text-center', className),
    children: [
      icon ? jsx('div', { className: 'text-primary', children: icon }) : null,
      jsx('h3', { className: 'text-lg font-semibold text-foreground', children: title }),
      description ? jsx('p', { className: 'max-w-md text-sm text-muted-foreground', children: description }) : null,
      action || null
    ]
  });
}
