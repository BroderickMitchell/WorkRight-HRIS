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
var empty_state_exports = {};
__export(empty_state_exports, {
  EmptyState: () => EmptyState
});
module.exports = __toCommonJS(empty_state_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_cn = require("../utils/cn");
function EmptyState({ icon, title, description, action, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: (0, import_cn.cn)("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-panel p-8 text-center", className), children: [
    icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-primary", children: icon }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-foreground", children: title }),
    description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "max-w-md text-sm text-muted-foreground", children: description }) : null,
    action
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EmptyState
});
