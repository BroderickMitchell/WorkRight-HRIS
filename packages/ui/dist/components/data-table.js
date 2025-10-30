"use strict";
'use client';
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var data_table_exports = {};
__export(data_table_exports, {
  DataTable: () => DataTable
});
module.exports = __toCommonJS(data_table_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react_table = require("@tanstack/react-table");
var import_react = require("react");
var import_button = require("./button");
var import_cn = require("../utils/cn");
function DataTable({ columns, data, emptyState, pageSize = 10, onRowClick, className }) {
  const [sorting, setSorting] = (0, import_react.useState)([]);
  const table = (0, import_react_table.useReactTable)({
    data,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: (0, import_react_table.getCoreRowModel)(),
    getPaginationRowModel: (0, import_react_table.getPaginationRowModel)(),
    getSortedRowModel: (0, import_react_table.getSortedRowModel)(),
    initialState: {
      pagination: {
        pageSize
      }
    }
  });
  const isEmpty = (0, import_react.useMemo)(() => data.length === 0, [data.length]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: (0, import_cn.cn)("overflow-hidden rounded-xl border border-border bg-panel shadow-sm shadow-black/5", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "w-full min-w-full table-fixed border-collapse", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { className: "bg-panel/70 text-xs uppercase tracking-wide text-muted-foreground", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: headerGroup.headers.map((header) => {
        if (header.isPlaceholder)
          return null;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { scope: "col", className: "px-4 py-3 text-left font-semibold", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            className: "flex items-center gap-1 text-left font-semibold hover:text-primary",
            onClick: header.column.getToggleSortingHandler(),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: (0, import_react_table.flexRender)(header.column.columnDef.header, header.getContext()) }),
              { asc: "\u25B2", desc: "\u25BC" }[header.column.getIsSorted()] ?? null
            ]
          }
        ) }, header.id);
      }) }, headerGroup.id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "px-6 py-12 text-center text-sm text-muted-foreground", colSpan: columns.length, children: emptyState ?? "No records to display" }) }) : table.getRowModel().rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "tr",
        {
          className: (0, import_cn.cn)(
            "group border-t border-border/80 hover:bg-primary/5",
            onRowClick ? "cursor-pointer" : ""
          ),
          onClick: () => onRowClick?.(row.original),
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "px-4 py-4 align-top text-sm text-foreground", children: (0, import_react_table.flexRender)(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
        },
        row.id
      )) })
    ] }),
    !isEmpty && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between border-t border-border bg-panel px-4 py-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        "Page ",
        table.getState().pagination.pageIndex + 1,
        " of ",
        table.getPageCount() || 1
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_button.Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => table.previousPage(),
            disabled: !table.getCanPreviousPage(),
            children: "Previous"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_button.Button, { variant: "ghost", size: "sm", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: "Next" })
      ] })
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DataTable
});
