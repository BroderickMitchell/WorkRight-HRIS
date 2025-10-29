import { jsx, jsxs } from "react/jsx-runtime";
import { cn } from "../utils/cn";
function EmptyState({ icon, title, description, action, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-panel p-8 text-center", className), children: [
    icon ? /* @__PURE__ */ jsx("div", { className: "text-primary", children: icon }) : null,
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground", children: title }),
    description ? /* @__PURE__ */ jsx("p", { className: "max-w-md text-sm text-muted-foreground", children: description }) : null,
    action
  ] });
}
export {
  EmptyState
};
