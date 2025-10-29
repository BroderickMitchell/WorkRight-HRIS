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
var kpi_card_exports = {};
__export(kpi_card_exports, {
  KpiCard: () => KpiCard
});
module.exports = __toCommonJS(kpi_card_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_card = require("./card");
var import_cn = require("../utils/cn");
function KpiCard({ label, value, delta, trend = "flat", icon, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_card.Card, { className: (0, import_cn.cn)("flex flex-col gap-2 p-5", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-primary", children: icon }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-3xl font-semibold text-foreground", children: value }),
    delta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: (0, import_cn.cn)("text-sm font-medium", trendColor(trend)), children: delta }) : null
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  KpiCard
});
