"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "./button";
import { cn } from "../utils/cn";
function DataTable({ columns, data, emptyState, pageSize = 10, onRowClick, className }) {
  const [sorting, setSorting] = useState([]);
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
  return /* @__PURE__ */ jsxs("div", { className: cn("overflow-hidden rounded-xl border border-border bg-panel shadow-sm shadow-black/5", className), children: [
    /* @__PURE__ */ jsxs("table", { className: "w-full min-w-full table-fixed border-collapse", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-panel/70 text-xs uppercase tracking-wide text-muted-foreground", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx("tr", { children: headerGroup.headers.map((header) => {
        if (header.isPlaceholder)
          return null;
        return /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left font-semibold", children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "flex items-center gap-1 text-left font-semibold hover:text-primary",
            onClick: header.column.getToggleSortingHandler(),
            children: [
              /* @__PURE__ */ jsx("span", { children: flexRender(header.column.columnDef.header, header.getContext()) }),
              { asc: "\u25B2", desc: "\u25BC" }[header.column.getIsSorted()] ?? null
            ]
          }
        ) }, header.id);
      }) }, headerGroup.id)) }),
      /* @__PURE__ */ jsx("tbody", { children: isEmpty ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-6 py-12 text-center text-sm text-muted-foreground", colSpan: columns.length, children: emptyState ?? "No records to display" }) }) : table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(
        "tr",
        {
          className: cn(
            "group border-t border-border/80 hover:bg-primary/5",
            onRowClick ? "cursor-pointer" : ""
          ),
          onClick: () => onRowClick?.(row.original),
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx("td", { className: "px-4 py-4 align-top text-sm text-foreground", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
        },
        row.id
      )) })
    ] }),
    !isEmpty && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-border bg-panel px-4 py-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Page ",
        table.getState().pagination.pageIndex + 1,
        " of ",
        table.getPageCount() || 1
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => table.previousPage(),
            disabled: !table.getCanPreviousPage(),
            children: "Previous"
          }
        ),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: "Next" })
      ] })
    ] })
  ] });
}
export {
  DataTable
};
