import * as react from 'react';
import { ButtonHTMLAttributes, HTMLAttributes, ReactNode, FormHTMLAttributes } from 'react';
import * as class_variance_authority_dist_types from 'class-variance-authority/dist/types';
import { VariantProps } from 'class-variance-authority';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ColumnDef } from '@tanstack/react-table';

/**
 * WorkRight button primitive built on the semantic design tokens.
 *
 * Example:
 * ```tsx
 * <Button variant="secondary" size="sm">View details</Button>
 * ```
 */
declare const buttonVariants: (props?: ({
    variant?: "primary" | "secondary" | "ghost" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<HTMLButtonElement>>;

/**
 * Elevated container used throughout dashboards and profile pages.
 */
declare function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
declare function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
declare function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): react_jsx_runtime.JSX.Element;
declare function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>): react_jsx_runtime.JSX.Element;

/**
 * Compact status indicator.
 */
declare function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>): react_jsx_runtime.JSX.Element;

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

type Density = 'comfortable' | 'compact';
interface ToolbarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    filters?: ReactNode;
    actions?: ReactNode;
    density?: Density;
    onDensityChange?: (density: Density) => void;
    className?: string;
}
/**
 * Toolbar with search, filters and density controls for tables.
 */
declare function Toolbar({ searchValue, onSearchChange, searchPlaceholder, filters, actions, density, onDensityChange, className }: ToolbarProps): react_jsx_runtime.JSX.Element;

interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    emptyState?: ReactNode;
    pageSize?: number;
    onRowClick?: (row: TData) => void;
    className?: string;
}
/**
 * Data grid abstraction around TanStack Table.
 */
declare function DataTable<TData>({ columns, data, emptyState, pageSize, onRowClick, className }: DataTableProps<TData>): react_jsx_runtime.JSX.Element;

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

interface StatGridProps {
    children: ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}
declare function StatGrid({ children, columns, className }: StatGridProps): react_jsx_runtime.JSX.Element;

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

/**
 * Tailwind theme bridge for WorkRight design tokens.
 *
 * Usage:
 * ```ts
 * import { tailwindTheme } from '@workright/ui/tokens';
 *
 * export default {
 *   theme: {
 *     extend: tailwindTheme,
 *   },
 * };
 * ```
 */
declare const tailwindColorVariables: {
    readonly bg: "rgb(var(--wr-bg) / <alpha-value>)";
    readonly panel: "rgb(var(--wr-panel) / <alpha-value>)";
    readonly text: "rgb(var(--wr-text) / <alpha-value>)";
    readonly muted: "rgb(var(--wr-muted) / <alpha-value>)";
    readonly primary: "rgb(var(--wr-primary) / <alpha-value>)";
    readonly 'primary-contrast': "rgb(var(--wr-primary-contrast) / <alpha-value>)";
    readonly accent: "rgb(var(--wr-accent) / <alpha-value>)";
    readonly danger: "rgb(var(--wr-danger) / <alpha-value>)";
    readonly warning: "rgb(var(--wr-warning) / <alpha-value>)";
    readonly success: "rgb(var(--wr-success) / <alpha-value>)";
    readonly border: "rgb(var(--wr-border) / <alpha-value>)";
    readonly ring: "rgb(var(--wr-ring) / <alpha-value>)";
};
declare const tailwindTheme: {
    colors: {
        background: "rgb(var(--wr-bg) / <alpha-value>)";
        panel: "rgb(var(--wr-panel) / <alpha-value>)";
        foreground: "rgb(var(--wr-text) / <alpha-value>)";
        text: "rgb(var(--wr-text) / <alpha-value>)";
        muted: {
            DEFAULT: "rgb(var(--wr-muted) / <alpha-value>)";
            foreground: string;
        };
        primary: {
            DEFAULT: "rgb(var(--wr-primary) / <alpha-value>)";
            foreground: "rgb(var(--wr-primary-contrast) / <alpha-value>)";
        };
        accent: {
            DEFAULT: "rgb(var(--wr-accent) / <alpha-value>)";
            foreground: "rgb(var(--wr-primary-contrast) / <alpha-value>)";
        };
        success: {
            DEFAULT: "rgb(var(--wr-success) / <alpha-value>)";
            foreground: string;
        };
        warning: {
            DEFAULT: "rgb(var(--wr-warning) / <alpha-value>)";
            foreground: string;
        };
        danger: {
            DEFAULT: "rgb(var(--wr-danger) / <alpha-value>)";
            foreground: string;
        };
        border: "rgb(var(--wr-border) / <alpha-value>)";
        ring: "rgb(var(--wr-ring) / <alpha-value>)";
    };
    borderColor: {
        DEFAULT: "rgb(var(--wr-border) / <alpha-value>)";
    };
    ringColor: {
        DEFAULT: "rgb(var(--wr-ring) / <alpha-value>)";
    };
    textColor: {
        DEFAULT: "rgb(var(--wr-text) / <alpha-value>)";
    };
    backgroundColor: {
        DEFAULT: "rgb(var(--wr-bg) / <alpha-value>)";
        panel: "rgb(var(--wr-panel) / <alpha-value>)";
    };
};
type TailwindTheme = typeof tailwindTheme;

type SemanticToken = '--wr-bg' | '--wr-panel' | '--wr-text' | '--wr-muted' | '--wr-primary' | '--wr-primary-contrast' | '--wr-accent' | '--wr-danger' | '--wr-warning' | '--wr-success' | '--wr-border' | '--wr-ring';

declare function cn(...inputs: Array<string | undefined | null | false>): string;

export { Badge, Button, type ButtonProps, Card, CardDescription, CardHeader, CardTitle, DataTable, type DataTableProps, type Density, Drawer, EmptyState, FormShell, KpiCard, Modal, PageActions, PageHeader, type PageHeaderProps, type SemanticToken, SplitPane, StatGrid, type TailwindTheme, Toolbar, type ToolbarProps, cn, tailwindColorVariables, tailwindTheme };
