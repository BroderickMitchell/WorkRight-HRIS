import { ReactNode } from 'react';
import { Card } from './card';
import { cn } from '../utils/cn';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: ReactNode;
  className?: string;
}

/**
 * Compact KPI tile for dashboards.
 */
export function KpiCard({ label, value, delta, trend = 'flat', icon, className }: KpiCardProps) {
  return (
    <Card className={cn('flex flex-col gap-2 p-5', className)}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        {icon ? <span className="text-primary">{icon}</span> : null}
      </div>
      <div className="text-3xl font-semibold text-foreground">{value}</div>
      {delta ? <span className={cn('text-sm font-medium', trendColor(trend))}>{delta}</span> : null}
    </Card>
  );
}

function trendColor(trend: 'up' | 'down' | 'flat') {
  switch (trend) {
    case 'up':
      return 'text-success';
    case 'down':
      return 'text-danger';
    default:
      return 'text-muted-foreground';
  }
}
