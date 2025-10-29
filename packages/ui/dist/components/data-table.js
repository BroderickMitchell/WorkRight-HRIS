const { jsxs, jsx, Fragment } = require('react/jsx-runtime');
const { useMemo, useState } = require('react');
const {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} = require('@tanstack/react-table');
const { Button } = require('./button');
const { cn } = require('../utils/cn');

function DataTable({ columns, data, emptyState, pageSize = 10, onRowClick, className }) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
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

  return jsxs('div', {
    className: cn('overflow-hidden rounded-xl border border-border bg-panel shadow-sm shadow-black/5', className),
    children: [
      jsxs('table', {
        className: 'w-full min-w-full table-fixed border-collapse',
        children: [
          jsxs('thead', {
            className: 'bg-panel/70 text-xs uppercase tracking-wide text-muted-foreground',
            children: table.getHeaderGroups().map((headerGroup) =>
              jsx('tr', {
                children: headerGroup.headers.map((header) => {
                  if (header.isPlaceholder) return null;
                  return jsx('th', {
                    scope: 'col',
                    className: 'px-4 py-3 text-left font-semibold',
                    children: jsxs('button', {
                      type: 'button',
                      className: 'flex items-center gap-1 text-left font-semibold hover:text-primary',
                      onClick: header.column.getToggleSortingHandler(),
                      children: [
                        jsx(Fragment, { children: flexRender(header.column.columnDef.header, header.getContext()) }),
                        ({ asc: '▲', desc: '▼' }[header.column.getIsSorted()] ?? null)
                      ]
                    })
                  }, header.id);
                })
              }, headerGroup.id)
            )
          }),
          jsx('tbody', {
            children: isEmpty
              ? jsx('tr', {
                  children: jsx('td', {
                    className: 'px-6 py-12 text-center text-sm text-muted-foreground',
                    colSpan: columns.length,
                    children: emptyState ?? 'No records to display'
                  })
                })
              : table.getRowModel().rows.map((row) =>
                  jsxs('tr', {
                    className: cn('group border-t border-border/80 hover:bg-primary/5', onRowClick ? 'cursor-pointer' : ''),
                    onClick: () => onRowClick && onRowClick(row.original),
                    children: row.getVisibleCells().map((cell) =>
                      jsx('td', {
                        className: 'px-4 py-4 align-top text-sm text-foreground',
                        children: flexRender(cell.column.columnDef.cell, cell.getContext())
                      }, cell.id)
                    )
                  }, row.id)
                )
          })
        ]
      }),
      !isEmpty && jsxs('div', {
        className: 'flex items-center justify-between border-t border-border bg-panel px-4 py-3 text-xs text-muted-foreground',
        children: [
          jsx('span', {
            children: `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount() || 1}`
          }),
          jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              jsx(Button, {
                variant: 'ghost',
                size: 'sm',
                onClick: () => table.previousPage(),
                disabled: !table.getCanPreviousPage(),
                children: 'Previous'
              }),
              jsx(Button, {
                variant: 'ghost',
                size: 'sm',
                onClick: () => table.nextPage(),
                disabled: !table.getCanNextPage(),
                children: 'Next'
              })
            ]
          })
        ]
      })
    ]
  });
}

module.exports = { DataTable };
