import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    position?: 'right' | 'left';
    className?: string;
}
declare function Drawer({ open, onClose, title, description, children, footer, position, className }: DrawerProps): react_jsx_runtime.JSX.Element;

export { Drawer };
