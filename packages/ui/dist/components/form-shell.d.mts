import * as react_jsx_runtime from 'react/jsx-runtime';
import { FormHTMLAttributes, ReactNode } from 'react';

interface FormShellProps extends FormHTMLAttributes<HTMLFormElement> {
    title: string;
    description?: string;
    footer?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}
/**
 * Opinionated form wrapper with sticky footer for actions.
 */
declare function FormShell({ title, description, footer, actions, children, className, ...props }: FormShellProps): react_jsx_runtime.JSX.Element;

export { FormShell };
