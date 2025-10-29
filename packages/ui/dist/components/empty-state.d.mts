import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}
/**
 * Friendly empty state for data heavy pages.
 */
declare function EmptyState({ icon, title, description, action, className }: EmptyStateProps): react_jsx_runtime.JSX.Element;

export { EmptyState };
