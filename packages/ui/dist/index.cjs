'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');
var classVarianceAuthority = require('class-variance-authority');
var React = require('react');
var jsxRuntime = require('react/jsx-runtime');
var lucideReact = require('lucide-react');
var react = require('@headlessui/react');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

// src/utils/cn.ts
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}
var buttonVariants = classVarianceAuthority.cva(
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
var Button = React.forwardRef(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const composedClassName = cn(buttonVariants({ variant, size }), className);
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        className: cn(composedClassName, children.props?.className),
        ...props
      });
    }
    return /* @__PURE__ */ jsxRuntime.jsx("button", { ref, className: composedClassName, ...props, children });
  }
);
Button.displayName = "Button";
function Badge({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
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
var Card = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("div", { ref, className: cn("rounded-lg border bg-card text-card-foreground shadow-sm", className), ...props })
);
Card.displayName = "Card";
var CardHeader = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
var CardTitle = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("h3", { ref, className: cn("text-2xl font-semibold leading-none tracking-tight", className), ...props })
);
CardTitle.displayName = "CardTitle";
var CardDescription = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("p", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
var CardContent = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
var CardFooter = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
function EmptyState({ icon, title, description, action, className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-panel p-8 text-center", className), children: [
    icon ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-primary", children: icon }) : null,
    /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold text-foreground", children: title }),
    description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "max-w-md text-sm text-muted-foreground", children: description }) : null,
    action
  ] });
}
function KpiCard({ label, value, delta, trend = "flat", icon, className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(Card, { className: cn("flex flex-col gap-2 p-5", className), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: label }),
      icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-primary", children: icon }) : null
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-3xl font-semibold text-foreground", children: value }),
    delta ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("text-sm font-medium", trendColor(trend)), children: delta }) : null
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
function StatGrid({ children, columns = 4, className }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("grid gap-4", gridCols(columns), className), children });
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
function PageHeader({ title, subtitle, breadcrumb, actions, className, children }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex flex-col gap-6 border-b border-border pb-6", className), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
        breadcrumb ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: breadcrumb }) : null,
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "text-2xl font-semibold text-foreground md:text-3xl", children: title }),
          subtitle ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-sm text-muted-foreground md:text-base", children: subtitle }) : null
        ] })
      ] }),
      actions
    ] }),
    children
  ] });
}
function PageActions({ children, className }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("flex flex-wrap items-center gap-2", className), children });
}
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
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-panel/80 p-4 shadow-sm shadow-black/5 backdrop-blur supports-[backdrop-filter]:bg-panel/60 md:flex-row md:items-center md:justify-between",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-1 flex-col gap-3 md:flex-row md:items-center", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntime.jsx(
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
          filters ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-2", children: filters }) : null
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          onDensityChange ? /* @__PURE__ */ jsxRuntime.jsx(DensitySwitch, { density, onDensityChange }) : null,
          actions
        ] })
      ]
    }
  );
}
function DensitySwitch({ density, onDensityChange }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-flex items-center gap-1 rounded-full border border-border bg-panel p-1 text-xs text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
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
    /* @__PURE__ */ jsxRuntime.jsx(
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
function Drawer({ open, onClose, title, description, children, footer, position = "right", className }) {
  return /* @__PURE__ */ jsxRuntime.jsx(react.Transition, { show: open, as: React.Fragment, children: /* @__PURE__ */ jsxRuntime.jsxs(react.Dialog, { as: "div", className: "relative z-50", onClose, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      react.Transition.Child,
      {
        as: React.Fragment,
        enter: "ease-out duration-200",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-150",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 bg-black/40", "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("flex h-full", position === "right" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxRuntime.jsx(
      react.Transition.Child,
      {
        as: React.Fragment,
        enter: "transform transition ease-out duration-300",
        enterFrom: position === "right" ? "translate-x-full" : "-translate-x-full",
        enterTo: "translate-x-0",
        leave: "transform transition ease-in duration-200",
        leaveFrom: "translate-x-0",
        leaveTo: position === "right" ? "translate-x-full" : "-translate-x-full",
        children: /* @__PURE__ */ jsxRuntime.jsxs(
          react.Dialog.Panel,
          {
            className: cn(
              "flex h-full w-full max-w-lg flex-col border-border bg-panel shadow-2xl focus:outline-none",
              position === "right" ? "border-l" : "border-r",
              className
            ),
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border-b border-border px-6 py-4", children: [
                /* @__PURE__ */ jsxRuntime.jsx(react.Dialog.Title, { className: "text-base font-semibold text-foreground", children: title }),
                description ? /* @__PURE__ */ jsxRuntime.jsx(react.Dialog.Description, { className: "mt-1 text-sm text-muted-foreground", children: description }) : null
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 overflow-y-auto px-6 py-4", children }),
              footer ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-border bg-panel px-6 py-4", children: footer }) : null
            ]
          }
        )
      }
    ) }) })
  ] }) });
}
var sizeMap = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl"
};
function Modal({ open, onClose, title, description, children, footer, size = "md", className }) {
  return /* @__PURE__ */ jsxRuntime.jsx(react.Transition, { show: open, as: React.Fragment, children: /* @__PURE__ */ jsxRuntime.jsxs(react.Dialog, { as: "div", className: "relative z-50", onClose, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      react.Transition.Child,
      {
        as: React.Fragment,
        enter: "ease-out duration-200",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-150",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 bg-black/40", "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntime.jsx(
      react.Transition.Child,
      {
        as: React.Fragment,
        enter: "ease-out duration-200",
        enterFrom: "opacity-0 translate-y-6",
        enterTo: "opacity-100 translate-y-0",
        leave: "ease-in duration-150",
        leaveFrom: "opacity-100 translate-y-0",
        leaveTo: "opacity-0 translate-y-6",
        children: /* @__PURE__ */ jsxRuntime.jsxs(
          react.Dialog.Panel,
          {
            className: cn(
              "w-full rounded-2xl border border-border bg-panel p-6 shadow-2xl focus:outline-none",
              sizeMap[size],
              className
            ),
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(react.Dialog.Title, { className: "text-lg font-semibold text-foreground", children: title }),
              description ? /* @__PURE__ */ jsxRuntime.jsx(react.Dialog.Description, { className: "mt-1 text-sm text-muted-foreground", children: description }) : null,
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-4 space-y-4", children }),
              footer ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-6 flex items-center justify-end gap-3", children: footer }) : null
            ]
          }
        )
      }
    ) }) })
  ] }) });
}
function FormShell({ title, description, footer, actions, children, className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("form", { className: cn("flex h-full flex-col gap-6", className), ...props, children: [
    /* @__PURE__ */ jsxRuntime.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs(CardHeader, { className: "mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(CardTitle, { children: title }),
          description ? /* @__PURE__ */ jsxRuntime.jsx(CardDescription, { children: description }) : null
        ] }),
        actions
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-6", children })
    ] }),
    footer ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-border bg-panel/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-panel/80", children: footer }) : null
  ] });
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

exports.Badge = Badge;
exports.Button = Button;
exports.Card = Card;
exports.CardContent = CardContent;
exports.CardDescription = CardDescription;
exports.CardFooter = CardFooter;
exports.CardHeader = CardHeader;
exports.CardTitle = CardTitle;
exports.Drawer = Drawer;
exports.EmptyState = EmptyState;
exports.FormShell = FormShell;
exports.KpiCard = KpiCard;
exports.Modal = Modal;
exports.PageActions = PageActions;
exports.PageHeader = PageHeader;
exports.StatGrid = StatGrid;
exports.Toolbar = Toolbar;
exports.cn = cn;
exports.tailwindColorVariables = tailwindColorVariables;
exports.tailwindTheme = tailwindTheme;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map