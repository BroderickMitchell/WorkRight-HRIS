"use strict";
"use client";
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
var modal_exports = {};
__export(modal_exports, {
  Modal: () => Modal
});
module.exports = __toCommonJS(modal_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = require("@headlessui/react");
var import_react2 = require("react");
var import_cn = require("../utils/cn");
const sizeMap = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl"
};
function Modal({ open, onClose, title, description, children, footer, size = "md", className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Transition, { show: open, as: import_react2.Fragment, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Dialog, { as: "div", className: "relative z-50", onClose, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_react.Transition.Child,
      {
        as: import_react2.Fragment,
        enter: "ease-out duration-200",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-150",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fixed inset-0 bg-black/40", "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fixed inset-0 overflow-y-auto", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex min-h-full items-center justify-center p-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_react.Transition.Child,
      {
        as: import_react2.Fragment,
        enter: "ease-out duration-200",
        enterFrom: "opacity-0 translate-y-6",
        enterTo: "opacity-100 translate-y-0",
        leave: "ease-in duration-150",
        leaveFrom: "opacity-100 translate-y-0",
        leaveTo: "opacity-0 translate-y-6",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          import_react.Dialog.Panel,
          {
            className: (0, import_cn.cn)(
              "w-full rounded-2xl border border-border bg-panel p-6 shadow-2xl focus:outline-none",
              sizeMap[size],
              className
            ),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Dialog.Title, { className: "text-lg font-semibold text-foreground", children: title }),
              description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Dialog.Description, { className: "mt-1 text-sm text-muted-foreground", children: description }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 space-y-4", children }),
              footer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 flex items-center justify-end gap-3", children: footer }) : null
            ]
          }
        )
      }
    ) }) })
  ] }) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Modal
});
