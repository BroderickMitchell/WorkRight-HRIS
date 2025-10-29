import * as react_jsx_runtime from 'react/jsx-runtime';
import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

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

export { DataTable, DataTableProps };
