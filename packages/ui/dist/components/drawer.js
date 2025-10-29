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
var drawer_exports = {};
__export(drawer_exports, {
  Drawer: () => Drawer
});
module.exports = __toCommonJS(drawer_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = require("@headlessui/react");
var import_react2 = require("react");
var import_cn = require("../utils/cn");
function Drawer({ open, onClose, title, description, children, footer, position = "right", className }) {
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fixed inset-0 overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: (0, import_cn.cn)("flex h-full", position === "right" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_react.Transition.Child,
      {
        as: import_react2.Fragment,
        enter: "transform transition ease-out duration-300",
        enterFrom: position === "right" ? "translate-x-full" : "-translate-x-full",
        enterTo: "translate-x-0",
        leave: "transform transition ease-in duration-200",
        leaveFrom: "translate-x-0",
        leaveTo: position === "right" ? "translate-x-full" : "-translate-x-full",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          import_react.Dialog.Panel,
          {
            className: (0, import_cn.cn)(
              "flex h-full w-full max-w-lg flex-col border-border bg-panel shadow-2xl focus:outline-none",
              position === "right" ? "border-l" : "border-r",
              className
            ),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "border-b border-border px-6 py-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Dialog.Title, { className: "text-base font-semibold text-foreground", children: title }),
                description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Dialog.Description, { className: "mt-1 text-sm text-muted-foreground", children: description }) : null
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 overflow-y-auto px-6 py-4", children }),
              footer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-t border-border bg-panel px-6 py-4", children: footer }) : null
            ]
          }
        )
      }
    ) }) })
  ] }) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Drawer
});
