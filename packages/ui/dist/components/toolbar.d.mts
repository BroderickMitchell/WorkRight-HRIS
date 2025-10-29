import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

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

export { type Density, Toolbar, type ToolbarProps };
