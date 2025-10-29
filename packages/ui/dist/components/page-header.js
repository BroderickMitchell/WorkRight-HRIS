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
var page_header_exports = {};
__export(page_header_exports, {
  PageActions: () => PageActions,
  PageHeader: () => PageHeader
});
module.exports = __toCommonJS(page_header_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_cn = require("../utils/cn");
function PageHeader({ title, subtitle, breadcrumb, actions, className, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: (0, import_cn.cn)("flex flex-col gap-6 border-b border-border pb-6", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-2", children: [
        breadcrumb ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: breadcrumb }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { className: "text-2xl font-semibold text-foreground md:text-3xl", children: title }),
          subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-1 text-sm text-muted-foreground md:text-base", children: subtitle }) : null
        ] })
      ] }),
      actions
    ] }),
    children
  ] });
}
function PageActions({ children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: (0, import_cn.cn)("flex flex-wrap items-center gap-2", className), children });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PageActions,
  PageHeader
});
