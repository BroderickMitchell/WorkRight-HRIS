import { jsx, jsxs } from 'react/jsx-runtime';
import { Search } from 'lucide-react';
import { cn } from '../utils/cn.mjs';

export function Toolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  filters,
  actions,
  density = 'comfortable',
  onDensityChange,
  className
}) {
  return jsxs('div', {
    className: cn(
      'flex flex-col gap-4 rounded-xl border border-border bg-panel/80 p-4 shadow-sm shadow-black/5 backdrop-blur supports-[backdrop-filter]:bg-panel/60 md:flex-row md:items-center md:justify-between',
      className
    ),
    children: [
      jsxs('div', {
        className: 'flex flex-1 flex-col gap-3 md:flex-row md:items-center',
        children: [
          jsxs('div', {
            className: 'relative flex-1',
            children: [
              jsx(Search, { className: 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground', 'aria-hidden': true }),
              jsx('input', {
                type: 'search',
                value: searchValue,
                onChange: (event) => onSearchChange(event.target.value),
                className: 'h-11 w-full rounded-lg border border-border bg-panel pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
                placeholder: searchPlaceholder,
                'aria-label': searchPlaceholder
              })
            ]
          }),
          filters ? jsx('div', { className: 'flex flex-wrap items-center gap-2', children: filters }) : null
        ]
      }),
      jsxs('div', {
        className: 'flex flex-wrap items-center gap-2',
        children: [
          onDensityChange ? jsx(DensitySwitch, { density, onDensityChange }) : null,
          actions || null
        ]
      })
    ]
  });
}

function DensitySwitch({ density, onDensityChange }) {
  return jsxs('div', {
    className: 'inline-flex items-center gap-1 rounded-full border border-border bg-panel p-1 text-xs text-muted-foreground',
    children: [
      jsx('button', {
        type: 'button',
        onClick: () => onDensityChange('comfortable'),
        className: cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          density === 'comfortable' ? 'bg-primary/10 text-primary' : ''
        ),
        'aria-pressed': density === 'comfortable',
        children: 'Comfort'
      }),
      jsx('button', {
        type: 'button',
        onClick: () => onDensityChange('compact'),
        className: cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          density === 'compact' ? 'bg-primary/10 text-primary' : ''
        ),
        'aria-pressed': density === 'compact',
        children: 'Compact'
      })
    ]
  });
}
