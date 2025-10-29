import { jsx, jsxs } from "react/jsx-runtime";
import { Card } from "./card";
import { cn } from "../utils/cn";
function KpiCard({ label, value, delta, trend = "flat", icon, className }) {
  return /* @__PURE__ */ jsxs(Card, { className: cn("flex flex-col gap-2 p-5", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: label }),
      icon ? /* @__PURE__ */ jsx("span", { className: "text-primary", children: icon }) : null
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-3xl font-semibold text-foreground", children: value }),
    delta ? /* @__PURE__ */ jsx("span", { className: cn("text-sm font-medium", trendColor(trend)), children: delta }) : null
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
export {
  KpiCard
};
