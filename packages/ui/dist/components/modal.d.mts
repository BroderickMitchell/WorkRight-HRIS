import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
declare function Modal({ open, onClose, title, description, children, footer, size, className }: ModalProps): react_jsx_runtime.JSX.Element;

export { Modal };
