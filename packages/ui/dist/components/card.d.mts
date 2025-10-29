import * as react_jsx_runtime from 'react/jsx-runtime';
import { HTMLAttributes } from 'react';

/**
 * Elevated container used throughout dashboards and profile pages.
 */
declare function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
declare function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
declare function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): react_jsx_runtime.JSX.Element;
declare function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>): react_jsx_runtime.JSX.Element;

export { Card, CardDescription, CardHeader, CardTitle };
