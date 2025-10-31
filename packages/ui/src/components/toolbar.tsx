import { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../utils/cn';

export type Density = 'comfortable' | 'compact';

export interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  density?: Density;
  onDensityChange?: (density: Density) => void;
  className?: string;
}

/**
 * Toolbar with search, filters and density controls for tables.
 */
export function Toolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  filters,
  actions,
  density = 'comfortable',
  onDensityChange,
  className
}: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-panel/80 p-4 shadow-sm shadow-black/5 backdrop-blur supports-[backdrop-filter]:bg-panel/60 md:flex-row md:items-center md:justify-between',
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            className="h-11 w-full rounded-lg border border-border bg-panel pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>
        {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onDensityChange ? <DensitySwitch density={density} onDensityChange={onDensityChange} /> : null}
        {actions}
      </div>
    </div>
  );
}

function DensitySwitch({ density, onDensityChange }: { density: Density; onDensityChange: (density: Density) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-panel p-1 text-xs text-muted-foreground">
      <button
        type="button"
        onClick={() => onDensityChange('comfortable')}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          density === 'comfortable' ? 'bg-primary/10 text-primary' : ''
        )}
        aria-pressed={density === 'comfortable'}
      >
        Comfort
      </button>
      <button
        type="button"
        onClick={() => onDensityChange('compact')}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          density === 'compact' ? 'bg-primary/10 text-primary' : ''
        )}
        aria-pressed={density === 'compact'}
      >
        Compact
      </button>
    </div>
  );
}
