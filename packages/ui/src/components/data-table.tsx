"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { ReactNode, useMemo, useState } from 'react';
import { Button } from './button';
import { cn } from '../utils/cn';

export interface DataTableProps<TData> {
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
export function DataTable<TData>({ columns, data, emptyState, pageSize = 10, onRowClick, className }: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize
      }
    }
  });

  const isEmpty = useMemo(() => data.length === 0, [data.length]);

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-panel shadow-sm shadow-black/5', className)}>
      <table className="w-full min-w-full table-fixed border-collapse">
        <thead className="bg-panel/70 text-xs uppercase tracking-wide text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                if (header.isPlaceholder) return null;
                return (
                  <th key={header.id} scope="col" className="px-4 py-3 text-left font-semibold">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-left font-semibold hover:text-primary"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      {{ asc: '▲', desc: '▼' }[header.column.getIsSorted() as string] ?? null}
                    </button>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td className="px-6 py-12 text-center text-sm text-muted-foreground" colSpan={columns.length}>
                {emptyState ?? 'No records to display'}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'group border-t border-border/80 hover:bg-primary/5',
                  onRowClick ? 'cursor-pointer' : ''
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 align-top text-sm text-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {!isEmpty && (
        <div className="flex items-center justify-between border-t border-border bg-panel px-4 py-3 text-xs text-muted-foreground">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="ghost" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
