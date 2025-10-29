"use strict";
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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Badge: () => Badge,
  Button: () => Button,
  Card: () => Card,
  CardDescription: () => CardDescription,
  CardHeader: () => CardHeader,
  CardTitle: () => CardTitle,
  DataTable: () => DataTable,
  Drawer: () => Drawer,
  EmptyState: () => EmptyState,
  FormShell: () => FormShell,
  KpiCard: () => KpiCard,
  Modal: () => Modal,
  PageActions: () => PageActions,
  PageHeader: () => PageHeader,
  SplitPane: () => SplitPane,
  StatGrid: () => StatGrid,
  Toolbar: () => Toolbar,
  cn: () => cn,
  tailwindColorVariables: () => tailwindColorVariables,
  tailwindTheme: () => tailwindTheme
});
module.exports = __toCommonJS(src_exports);

// src/components/button.tsx
var import_class_variance_authority = require("class-variance-authority");
var import_react = require("react");

// src/utils/cn.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/components/button.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var buttonVariants = (0, import_class_variance_authority.cva)(
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
var Button = (0, import_react.forwardRef)(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const composedClassName = cn(buttonVariants({ variant, size }), className);
    if (asChild && (0, import_react.isValidElement)(children)) {
      return (0, import_react.cloneElement)(children, {
        ref,
        className: cn(composedClassName, children.props?.className),
        ...props
      });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { ref, className: composedClassName, ...props, children });
  }
);
Button.displayName = "Button";

// src/components/card.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function Card({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      className: cn(
        "rounded-xl border border-border bg-panel p-6 shadow-sm shadow-black/5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn("mb-4 flex items-center justify-between gap-3", className), ...props });
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: cn("text-lg font-semibold text-foreground", className), ...props });
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: cn("text-sm text-muted-foreground", className), ...props });
}

// src/components/badge.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function Badge({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary",
        className
      ),
      ...props
    }
  );
}

// src/components/page-header.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function PageHeader({ title, subtitle, breadcrumb, actions, className, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: cn("flex flex-col gap-6 border-b border-border pb-6", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "space-y-2", children: [
        breadcrumb ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: breadcrumb }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h1", { className: "text-2xl font-semibold text-foreground md:text-3xl", children: title }),
          subtitle ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-1 text-sm text-muted-foreground md:text-base", children: subtitle }) : null
        ] })
      ] }),
      actions
    ] }),
    children
  ] });
}
function PageActions({ children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: cn("flex flex-wrap items-center gap-2", className), children });
}

// src/components/toolbar.tsx
var import_lucide_react = require("lucide-react");
var import_jsx_runtime5 = require("react/jsx-runtime");
function Toolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search",
  filters,
  actions,
  density = "comfortable",
  onDensityChange,
  className
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "div",
    {
      className: cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-panel/80 p-4 shadow-sm shadow-black/5 backdrop-blur supports-[backdrop-filter]:bg-panel/60 md:flex-row md:items-center md:justify-between",
        className
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex flex-1 flex-col gap-3 md:flex-row md:items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react.Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", "aria-hidden": true }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "input",
              {
                type: "search",
                value: searchValue,
                onChange: (event) => onSearchChange(event.target.value),
                className: "h-11 w-full rounded-lg border border-border bg-panel pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring",
                placeholder: searchPlaceholder,
                "aria-label": searchPlaceholder
              }
            )
          ] }),
          filters ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex flex-wrap items-center gap-2", children: filters }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex flex-wrap items-center gap-2", children: [
          onDensityChange ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DensitySwitch, { density, onDensityChange }) : null,
          actions
        ] })
      ]
    }
  );
}
function DensitySwitch({ density, onDensityChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "inline-flex items-center gap-1 rounded-full border border-border bg-panel p-1 text-xs text-muted-foreground", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        type: "button",
        onClick: () => onDensityChange("comfortable"),
        className: cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          density === "comfortable" ? "bg-primary/10 text-primary" : ""
        ),
        "aria-pressed": density === "comfortable",
        children: "Comfort"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        type: "button",
        onClick: () => onDensityChange("compact"),
        className: cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          density === "compact" ? "bg-primary/10 text-primary" : ""
        ),
        "aria-pressed": density === "compact",
        children: "Compact"
      }
    )
  ] });
}

// src/components/data-table.tsx
var import_react_table = require("@tanstack/react-table");
var import_react2 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function DataTable({ columns, data, emptyState, pageSize = 10, onRowClick, className }) {
  const [sorting, setSorting] = (0, import_react2.useState)([]);
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
  const isEmpty = (0, import_react2.useMemo)(() => data.length === 0, [data.length]);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: cn("overflow-hidden rounded-xl border border-border bg-panel shadow-sm shadow-black/5", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("table", { className: "w-full min-w-full table-fixed border-collapse", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("thead", { className: "bg-panel/70 text-xs uppercase tracking-wide text-muted-foreground", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tr", { children: headerGroup.headers.map((header) => {
        if (header.isPlaceholder)
          return null;
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { scope: "col", className: "px-4 py-3 text-left font-semibold", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
          "button",
          {
            type: "button",
            className: "flex items-center gap-1 text-left font-semibold hover:text-primary",
            onClick: header.column.getToggleSortingHandler(),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: (0, import_react_table.flexRender)(header.column.columnDef.header, header.getContext()) }),
              { asc: "\u25B2", desc: "\u25BC" }[header.column.getIsSorted()] ?? null
            ]
          }
        ) }, header.id);
      }) }, headerGroup.id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tbody", { children: isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "px-6 py-12 text-center text-sm text-muted-foreground", colSpan: columns.length, children: emptyState ?? "No records to display" }) }) : table.getRowModel().rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "tr",
        {
          className: cn(
            "group border-t border-border/80 hover:bg-primary/5",
            onRowClick ? "cursor-pointer" : ""
          ),
          onClick: () => onRowClick?.(row.original),
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "px-4 py-4 align-top text-sm text-foreground", children: (0, import_react_table.flexRender)(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
        },
        row.id
      )) })
    ] }),
    !isEmpty && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center justify-between border-t border-border bg-panel px-4 py-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
        "Page ",
        table.getState().pagination.pageIndex + 1,
        " of ",
        table.getPageCount() || 1
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => table.previousPage(),
            disabled: !table.getCanPreviousPage(),
            children: "Previous"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { variant: "ghost", size: "sm", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: "Next" })
      ] })
    ] })
  ] });
}

// src/components/empty-state.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function EmptyState({ icon, title, description, action, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-panel p-8 text-center", className), children: [
    icon ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-primary", children: icon }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "text-lg font-semibold text-foreground", children: title }),
    description ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "max-w-md text-sm text-muted-foreground", children: description }) : null,
    action
  ] });
}

// src/components/split-pane.tsx
var import_react3 = require("react");
var import_lucide_react2 = require("lucide-react");
var import_jsx_runtime8 = require("react/jsx-runtime");
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
  const containerRef = (0, import_react3.useRef)(null);
  const [detailWidth, setDetailWidth] = (0, import_react3.useState)(defaultDetailWidth);
  const [isDragging, setIsDragging] = (0, import_react3.useState)(false);
  const [collapsed, setCollapsed] = (0, import_react3.useState)(initiallyCollapsed);
  const toggleCollapsed = (0, import_react3.useCallback)(() => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  }, [collapsed, onCollapsedChange]);
  (0, import_react3.useEffect)(() => {
    function handleMouseMove(event) {
      if (!isDragging || collapsed)
        return;
      const container = containerRef.current;
      if (!container)
        return;
      const rect = container.getBoundingClientRect();
      const maxWidth = rect.width - 200;
      const newWidth = Math.min(Math.max(rect.right - event.clientX, minDetailWidth), maxWidth);
      event.preventDefault();
      setDetailWidth(newWidth);
    }
    function handleMouseUp() {
      if (isDragging)
        setIsDragging(false);
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [collapsed, isDragging, minDetailWidth]);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { ref: containerRef, className: cn("flex h-full w-full flex-col gap-4", className), children: [
    collapsible ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex justify-end", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
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
          collapsed ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react2.PanelRightOpen, { className: "h-4 w-4", "aria-hidden": true }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react2.PanelRightClose, { className: "h-4 w-4", "aria-hidden": true }),
          collapsed ? "Show details" : "Hide details"
        ]
      }
    ) }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex min-h-0 flex-1 gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("section", { className: "flex-1 overflow-auto rounded-xl border border-border bg-panel p-4 shadow-sm", "aria-label": "Primary list", children: list }),
      !collapsed ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
        "aside",
        {
          id: "split-pane-detail",
          className: "relative hidden h-full overflow-auto rounded-xl border border-border bg-panel shadow-sm lg:block",
          style: { width: detailWidth },
          "aria-label": "Detail",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "h-full overflow-y-auto p-4", children: detail })
          ]
        }
      ) : null
    ] })
  ] });
}

// src/components/kpi-card.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
function KpiCard({ label, value, delta, trend = "flat", icon, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(Card, { className: cn("flex flex-col gap-2 p-5", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: label }),
      icon ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-primary", children: icon }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-3xl font-semibold text-foreground", children: value }),
    delta ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: cn("text-sm font-medium", trendColor(trend)), children: delta }) : null
  ] });
}
function trendColor(trend) {
  switch (trend) {
    case "up":
      return "text-success";
    case "down":
      return "text-danger";
    default:
      return "text-muted-foreground";
  }
}

// src/components/stat-grid.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
function StatGrid({ children, columns = 4, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: cn("grid gap-4", gridCols(columns), className), children });
}
function gridCols(columns) {
  switch (columns) {
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
    default:
      return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
  }
}

// src/components/form-shell.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
function FormShell({ title, description, footer, actions, children, className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("form", { className: cn("flex h-full flex-col gap-6", className), ...props, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(CardHeader, { className: "mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(CardTitle, { children: title }),
          description ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(CardDescription, { children: description }) : null
        ] }),
        actions
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "space-y-6", children })
    ] }),
    footer ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-border bg-panel/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-panel/80", children: footer }) : null
  ] });
}

// src/components/modal.tsx
var import_react4 = require("@headlessui/react");
var import_react5 = require("react");
var import_jsx_runtime12 = require("react/jsx-runtime");
var sizeMap = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl"
};
function Modal({ open, onClose, title, description, children, footer, size = "md", className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_react4.Transition, { show: open, as: import_react5.Fragment, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_react4.Dialog, { as: "div", className: "relative z-50", onClose, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      import_react4.Transition.Child,
      {
        as: import_react5.Fragment,
        enter: "ease-out duration-200",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-150",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
        children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "fixed inset-0 bg-black/40", "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "fixed inset-0 overflow-y-auto", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "flex min-h-full items-center justify-center p-4", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      import_react4.Transition.Child,
      {
        as: import_react5.Fragment,
        enter: "ease-out duration-200",
        enterFrom: "opacity-0 translate-y-6",
        enterTo: "opacity-100 translate-y-0",
        leave: "ease-in duration-150",
        leaveFrom: "opacity-100 translate-y-0",
        leaveTo: "opacity-0 translate-y-6",
        children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
          import_react4.Dialog.Panel,
          {
            className: cn(
              "w-full rounded-2xl border border-border bg-panel p-6 shadow-2xl focus:outline-none",
              sizeMap[size],
              className
            ),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_react4.Dialog.Title, { className: "text-lg font-semibold text-foreground", children: title }),
              description ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_react4.Dialog.Description, { className: "mt-1 text-sm text-muted-foreground", children: description }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "mt-4 space-y-4", children }),
              footer ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "mt-6 flex items-center justify-end gap-3", children: footer }) : null
            ]
          }
        )
      }
    ) }) })
  ] }) });
}

// src/components/drawer.tsx
var import_react6 = require("@headlessui/react");
var import_react7 = require("react");
var import_jsx_runtime13 = require("react/jsx-runtime");
function Drawer({ open, onClose, title, description, children, footer, position = "right", className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_react6.Transition, { show: open, as: import_react7.Fragment, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_react6.Dialog, { as: "div", className: "relative z-50", onClose, children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      import_react6.Transition.Child,
      {
        as: import_react7.Fragment,
        enter: "ease-out duration-200",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-150",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
        children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "fixed inset-0 bg-black/40", "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "fixed inset-0 overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: cn("flex h-full", position === "right" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      import_react6.Transition.Child,
      {
        as: import_react7.Fragment,
        enter: "transform transition ease-out duration-300",
        enterFrom: position === "right" ? "translate-x-full" : "-translate-x-full",
        enterTo: "translate-x-0",
        leave: "transform transition ease-in duration-200",
        leaveFrom: "translate-x-0",
        leaveTo: position === "right" ? "translate-x-full" : "-translate-x-full",
        children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
          import_react6.Dialog.Panel,
          {
            className: cn(
              "flex h-full w-full max-w-lg flex-col border-border bg-panel shadow-2xl focus:outline-none",
              position === "right" ? "border-l" : "border-r",
              className
            ),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "border-b border-border px-6 py-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_react6.Dialog.Title, { className: "text-base font-semibold text-foreground", children: title }),
                description ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_react6.Dialog.Description, { className: "mt-1 text-sm text-muted-foreground", children: description }) : null
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "flex-1 overflow-y-auto px-6 py-4", children }),
              footer ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "border-t border-border bg-panel px-6 py-4", children: footer }) : null
            ]
          }
        )
      }
    ) }) })
  ] }) });
}

// src/tokens/tailwind-theme.ts
var tailwindColorVariables = {
  bg: "rgb(var(--wr-bg) / <alpha-value>)",
  panel: "rgb(var(--wr-panel) / <alpha-value>)",
  text: "rgb(var(--wr-text) / <alpha-value>)",
  muted: "rgb(var(--wr-muted) / <alpha-value>)",
  primary: "rgb(var(--wr-primary) / <alpha-value>)",
  "primary-contrast": "rgb(var(--wr-primary-contrast) / <alpha-value>)",
  accent: "rgb(var(--wr-accent) / <alpha-value>)",
  danger: "rgb(var(--wr-danger) / <alpha-value>)",
  warning: "rgb(var(--wr-warning) / <alpha-value>)",
  success: "rgb(var(--wr-success) / <alpha-value>)",
  border: "rgb(var(--wr-border) / <alpha-value>)",
  ring: "rgb(var(--wr-ring) / <alpha-value>)"
};
var tailwindTheme = {
  colors: {
    background: tailwindColorVariables.bg,
    panel: tailwindColorVariables.panel,
    foreground: tailwindColorVariables.text,
    text: tailwindColorVariables.text,
    muted: {
      DEFAULT: tailwindColorVariables.muted,
      foreground: "rgb(var(--wr-text) / 0.65)"
    },
    primary: {
      DEFAULT: tailwindColorVariables.primary,
      foreground: tailwindColorVariables["primary-contrast"]
    },
    accent: {
      DEFAULT: tailwindColorVariables.accent,
      foreground: tailwindColorVariables["primary-contrast"]
    },
    success: {
      DEFAULT: tailwindColorVariables.success,
      foreground: "rgb(255 255 255 / <alpha-value>)"
    },
    warning: {
      DEFAULT: tailwindColorVariables.warning,
      foreground: "rgb(15 23 42 / <alpha-value>)"
    },
    danger: {
      DEFAULT: tailwindColorVariables.danger,
      foreground: "rgb(255 255 255 / <alpha-value>)"
    },
    border: tailwindColorVariables.border,
    ring: tailwindColorVariables.ring
  },
  borderColor: {
    DEFAULT: tailwindColorVariables.border
  },
  ringColor: {
    DEFAULT: tailwindColorVariables.ring
  },
  textColor: {
    DEFAULT: tailwindColorVariables.text
  },
  backgroundColor: {
    DEFAULT: tailwindColorVariables.bg,
    panel: tailwindColorVariables.panel
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Drawer,
  EmptyState,
  FormShell,
  KpiCard,
  Modal,
  PageActions,
  PageHeader,
  SplitPane,
  StatGrid,
  Toolbar,
  cn,
  tailwindColorVariables,
  tailwindTheme
});
