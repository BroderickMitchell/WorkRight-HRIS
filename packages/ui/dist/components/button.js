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
var button_exports = {};
__export(button_exports, {
  Button: () => Button
});
module.exports = __toCommonJS(button_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_class_variance_authority = require("class-variance-authority");
var import_react = require("react");
var import_cn = require("../utils/cn");
const buttonVariants = (0, import_class_variance_authority.cva)(
  "inline-flex items-center justify-center rounded-md border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground border-transparent hover:bg-primary/90",
        secondary: "border-border bg-panel text-foreground hover:bg-panel/80",
        ghost: "border-transparent text-primary hover:bg-primary/10"
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);
const Button = (0, import_react.forwardRef)(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const composedClassName = (0, import_cn.cn)(buttonVariants({ variant, size }), className);
    if (asChild && (0, import_react.isValidElement)(children)) {
      return (0, import_react.cloneElement)(children, {
        ref,
        className: (0, import_cn.cn)(composedClassName, children.props?.className),
        ...props
      });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { ref, className: composedClassName, ...props, children });
  }
);
Button.displayName = "Button";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Button
});
