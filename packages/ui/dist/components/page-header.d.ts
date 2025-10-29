import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

/**
 * Composable page header with breadcrumb and action slots.
 */
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumb?: ReactNode;
    actions?: ReactNode;
    className?: string;
    children?: ReactNode;
}
declare function PageHeader({ title, subtitle, breadcrumb, actions, className, children }: PageHeaderProps): react_jsx_runtime.JSX.Element;
declare function PageActions({ children, className }: {
    children: ReactNode;
    className?: string;
}): react_jsx_runtime.JSX.Element;

export { PageActions, PageHeader, type PageHeaderProps };
