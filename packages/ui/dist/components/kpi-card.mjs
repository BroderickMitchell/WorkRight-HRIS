import { jsx, jsxs } from 'react/jsx-runtime';
import { Card } from './card.mjs';
import { cn } from '../utils/cn.mjs';

export function KpiCard({ label, value, delta, trend = 'flat', icon, className }) {
  return jsxs(Card, {
    className: cn('flex flex-col gap-2 p-5', className),
    children: [
      jsxs('div', {
        className: 'flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        children: [
          jsx('span', { children: label }),
          icon ? jsx('span', { className: 'text-primary', children: icon }) : null
        ]
      }),
      jsx('div', { className: 'text-3xl font-semibold text-foreground', children: value }),
      delta ? jsx('span', { className: cn('text-sm font-medium', trendColor(trend)), children: delta }) : null
    ]
  });
}

function trendColor(trend) {
  switch (trend) {
    case 'up':
      return 'text-success';
    case 'down':
      return 'text-danger';
    default:
      return 'text-muted-foreground';
  }
}
