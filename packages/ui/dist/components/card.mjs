import { jsx } from "react/jsx-runtime";
import { cn } from "../utils/cn";
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsx("div", { className: cn("mb-4 flex items-center justify-between gap-3", className), ...props });
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx("h3", { className: cn("text-lg font-semibold text-foreground", className), ...props });
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx("p", { className: cn("text-sm text-muted-foreground", className), ...props });
}
export {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
};
