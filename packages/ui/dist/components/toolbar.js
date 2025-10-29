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
var toolbar_exports = {};
__export(toolbar_exports, {
  Toolbar: () => Toolbar
});
module.exports = __toCommonJS(toolbar_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_lucide_react = require("lucide-react");
var import_cn = require("../utils/cn");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: (0, import_cn.cn)(
        "flex flex-col gap-4 rounded-xl border border-border bg-panel/80 p-4 shadow-sm shadow-black/5 backdrop-blur supports-[backdrop-filter]:bg-panel/60 md:flex-row md:items-center md:justify-between",
        className
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-1 flex-col gap-3 md:flex-row md:items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", "aria-hidden": true }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
          filters ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap items-center gap-2", children: filters }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-wrap items-center gap-2", children: [
          onDensityChange ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DensitySwitch, { density, onDensityChange }) : null,
          actions
        ] })
      ]
    }
  );
}
function DensitySwitch({ density, onDensityChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "inline-flex items-center gap-1 rounded-full border border-border bg-panel p-1 text-xs text-muted-foreground", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        onClick: () => onDensityChange("comfortable"),
        className: (0, import_cn.cn)(
          "inline-flex items-center gap-1 rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          density === "comfortable" ? "bg-primary/10 text-primary" : ""
        ),
        "aria-pressed": density === "comfortable",
        children: "Comfort"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        onClick: () => onDensityChange("compact"),
        className: (0, import_cn.cn)(
          "inline-flex items-center gap-1 rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          density === "compact" ? "bg-primary/10 text-primary" : ""
        ),
        "aria-pressed": density === "compact",
        children: "Compact"
      }
    )
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Toolbar
});
