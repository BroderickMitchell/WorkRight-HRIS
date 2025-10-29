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
var card_exports = {};
__export(card_exports, {
  Card: () => Card,
  CardDescription: () => CardDescription,
  CardHeader: () => CardHeader,
  CardTitle: () => CardTitle
});
module.exports = __toCommonJS(card_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_cn = require("../utils/cn");
function Card({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: (0, import_cn.cn)(
        "rounded-xl border border-border bg-panel p-6 shadow-sm shadow-black/5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: (0, import_cn.cn)("mb-4 flex items-center justify-between gap-3", className), ...props });
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: (0, import_cn.cn)("text-lg font-semibold text-foreground", className), ...props });
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: (0, import_cn.cn)("text-sm text-muted-foreground", className), ...props });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
});
