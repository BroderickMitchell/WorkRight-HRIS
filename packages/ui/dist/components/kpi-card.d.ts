import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

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
declare function KpiCard({ label, value, delta, trend, icon, className }: KpiCardProps): react_jsx_runtime.JSX.Element;

export { KpiCard };
