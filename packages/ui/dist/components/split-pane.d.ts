import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

interface SplitPaneProps {
    list: ReactNode;
    detail: ReactNode;
    defaultDetailWidth?: number;
    minDetailWidth?: number;
    collapsible?: boolean;
    initiallyCollapsed?: boolean;
    onCollapsedChange?: (value: boolean) => void;
    className?: string;
}
/**
 * Responsive split view for master/detail experiences.
 */
declare function SplitPane({ list, detail, defaultDetailWidth, minDetailWidth, collapsible, initiallyCollapsed, onCollapsedChange, className }: SplitPaneProps): react_jsx_runtime.JSX.Element;

export { SplitPane };
