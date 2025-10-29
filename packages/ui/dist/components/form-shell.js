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
var form_shell_exports = {};
__export(form_shell_exports, {
  FormShell: () => FormShell
});
module.exports = __toCommonJS(form_shell_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_card = require("./card");
var import_cn = require("../utils/cn");
function FormShell({ title, description, footer, actions, children, className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", { className: (0, import_cn.cn)("flex h-full flex-col gap-6", className), ...props, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_card.Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_card.CardHeader, { className: "mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_card.CardTitle, { children: title }),
          description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_card.CardDescription, { children: description }) : null
        ] }),
        actions
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-6", children })
    ] }),
    footer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-border bg-panel/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-panel/80", children: footer }) : null
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FormShell
});
