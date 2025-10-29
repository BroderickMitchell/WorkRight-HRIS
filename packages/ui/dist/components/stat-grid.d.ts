import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

interface StatGridProps {
    children: ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}
declare function StatGrid({ children, columns, className }: StatGridProps): react_jsx_runtime.JSX.Element;

export { StatGrid };
