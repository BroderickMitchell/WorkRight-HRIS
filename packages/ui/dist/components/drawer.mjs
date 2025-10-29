"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { cn } from "../utils/cn";
function Drawer({ open, onClose, title, description, children, footer, position = "right", className }) {
  return /* @__PURE__ */ jsx(Transition, { show: open, as: Fragment, children: /* @__PURE__ */ jsxs(Dialog, { as: "div", className: "relative z-50", onClose, children: [
    /* @__PURE__ */ jsx(
      Transition.Child,
      {
        as: Fragment,
        enter: "ease-out duration-200",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-150",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
        children: /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/40", "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: cn("flex h-full", position === "right" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsx(
      Transition.Child,
      {
        as: Fragment,
        enter: "transform transition ease-out duration-300",
        enterFrom: position === "right" ? "translate-x-full" : "-translate-x-full",
        enterTo: "translate-x-0",
        leave: "transform transition ease-in duration-200",
        leaveFrom: "translate-x-0",
        leaveTo: position === "right" ? "translate-x-full" : "-translate-x-full",
        children: /* @__PURE__ */ jsxs(
          Dialog.Panel,
          {
            className: cn(
              "flex h-full w-full max-w-lg flex-col border-border bg-panel shadow-2xl focus:outline-none",
              position === "right" ? "border-l" : "border-r",
              className
            ),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "border-b border-border px-6 py-4", children: [
                /* @__PURE__ */ jsx(Dialog.Title, { className: "text-base font-semibold text-foreground", children: title }),
                description ? /* @__PURE__ */ jsx(Dialog.Description, { className: "mt-1 text-sm text-muted-foreground", children: description }) : null
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-6 py-4", children }),
              footer ? /* @__PURE__ */ jsx("div", { className: "border-t border-border bg-panel px-6 py-4", children: footer }) : null
            ]
          }
        )
      }
    ) }) })
  ] }) });
}
export {
  Drawer
};
