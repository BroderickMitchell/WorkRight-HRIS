"use client";
import { useReactTable, getSortedRowModel, getPaginationRowModel, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { forwardRef, isValidElement, cloneElement, useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsx, jsxs } from 'react/jsx-runtime';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
var buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground border-transparent hover:bg-primary/90",
        secondary: "border-border bg-panel text-foreground hover:bg-panel/80",
        ghost: "border-transparent text-primary hover:bg-primary/10"
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);
var Button = forwardRef(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const composedClassName = cn(buttonVariants({ variant, size }), className);
    if (asChild && isValidElement(children)) {
      return cloneElement(children, {
        ref,
        className: cn(composedClassName, children.props?.className),
        ...props
      });
    }
    return /* @__PURE__ */ jsx("button", { ref, className: composedClassName, ...props, children });
  }
);
Button.displayName = "Button";
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
        if (header.isPlaceholder) return null;
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
function SplitPane({
  list,
  detail,
  defaultDetailWidth = 380,
  minDetailWidth = 280,
  collapsible = true,
  initiallyCollapsed = false,
  onCollapsedChange,
  className
}) {
  const containerRef = useRef(null);
  const [detailWidth, setDetailWidth] = useState(defaultDetailWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const toggleCollapsed = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  }, [collapsed, onCollapsedChange]);
  useEffect(() => {
    function handleMouseMove(event) {
      if (!isDragging || collapsed) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const maxWidth = rect.width - 200;
      const newWidth = Math.min(Math.max(rect.right - event.clientX, minDetailWidth), maxWidth);
      event.preventDefault();
      setDetailWidth(newWidth);
    }
    function handleMouseUp() {
      if (isDragging) setIsDragging(false);
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [collapsed, isDragging, minDetailWidth]);
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: cn("flex h-full w-full flex-col gap-4", className), children: [
    collapsible ? /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
      Button,
      {
        type: "button",
        variant: "ghost",
        size: "sm",
        className: "gap-2",
        onClick: toggleCollapsed,
        "aria-expanded": !collapsed,
        "aria-controls": "split-pane-detail",
        children: [
          collapsed ? /* @__PURE__ */ jsx(PanelRightOpen, { className: "h-4 w-4", "aria-hidden": true }) : /* @__PURE__ */ jsx(PanelRightClose, { className: "h-4 w-4", "aria-hidden": true }),
          collapsed ? "Show details" : "Hide details"
        ]
      }
    ) }) : null,
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-1 gap-4", children: [
      /* @__PURE__ */ jsx("section", { className: "flex-1 overflow-auto rounded-xl border border-border bg-panel p-4 shadow-sm", "aria-label": "Primary list", children: list }),
      !collapsed ? /* @__PURE__ */ jsxs(
        "aside",
        {
          id: "split-pane-detail",
          className: "relative hidden h-full overflow-auto rounded-xl border border-border bg-panel shadow-sm lg:block",
          style: { width: detailWidth },
          "aria-label": "Detail",
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: cn(
                  "absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent"
                ),
                role: "separator",
                "aria-orientation": "vertical",
                "aria-label": "Resize detail panel",
                onMouseDown: (event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "h-full overflow-y-auto p-4", children: detail })
          ]
        }
      ) : null
    ] })
  ] });
}

export { DataTable, SplitPane };
//# sourceMappingURL=client.mjs.map
//# sourceMappingURL=client.mjs.map