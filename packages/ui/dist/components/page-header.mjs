import { jsx, jsxs } from "react/jsx-runtime";
import { cn } from "../utils/cn";
function PageHeader({ title, subtitle, breadcrumb, actions, className, children }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-6 border-b border-border pb-6", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        breadcrumb ? /* @__PURE__ */ jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: breadcrumb }) : null,
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-foreground md:text-3xl", children: title }),
          subtitle ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground md:text-base", children: subtitle }) : null
        ] })
      ] }),
      actions
    ] }),
    children
  ] });
}
function PageActions({ children, className }) {
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-wrap items-center gap-2", className), children });
}
export {
  PageActions,
  PageHeader
};
