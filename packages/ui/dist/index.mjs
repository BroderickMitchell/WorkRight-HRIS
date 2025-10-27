// src/components/button.tsx
import { cva } from "class-variance-authority";
import { forwardRef } from "react";

// src/utils/cn.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/components/button.tsx
import { jsx } from "react/jsx-runtime";
var buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white border-transparent hover:bg-brand/90",
        secondary: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
        ghost: "text-brand hover:bg-brand/10 border-transparent"
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
  ({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsx("button", { ref, className: cn(buttonVariants({ variant, size }), className), ...props })
);
Button.displayName = "Button";

// src/components/card.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "div",
    {
      className: cn(
        "rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 focus-within:ring-2 focus-within:ring-brand",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx2("div", { className: cn("mb-4 flex items-center justify-between gap-3", className), ...props });
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx2("h3", { className: cn("text-lg font-semibold text-slate-900", className), ...props });
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx2("p", { className: cn("text-sm text-slate-600", className), ...props });
}

// src/components/badge.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function Badge({ className, ...props }) {
  return /* @__PURE__ */ jsx3(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand",
        className
      ),
      ...props
    }
  );
}
export {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle
};
