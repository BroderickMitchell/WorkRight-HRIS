import { jsx, jsxs } from "react/jsx-runtime";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";
import { cn } from "../utils/cn";
function FormShell({ title, description, footer, actions, children, className, ...props }) {
  return /* @__PURE__ */ jsxs("form", { className: cn("flex h-full flex-col gap-6", className), ...props, children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: title }),
          description ? /* @__PURE__ */ jsx(CardDescription, { children: description }) : null
        ] }),
        actions
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children })
    ] }),
    footer ? /* @__PURE__ */ jsx("div", { className: "sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-border bg-panel/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-panel/80", children: footer }) : null
  ] });
}
export {
  FormShell
};
