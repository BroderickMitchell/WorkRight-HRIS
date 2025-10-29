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
var tailwind_theme_exports = {};
__export(tailwind_theme_exports, {
  tailwindColorVariables: () => tailwindColorVariables,
  tailwindTheme: () => tailwindTheme
});
module.exports = __toCommonJS(tailwind_theme_exports);
const tailwindColorVariables = {
  bg: "rgb(var(--wr-bg) / <alpha-value>)",
  panel: "rgb(var(--wr-panel) / <alpha-value>)",
  text: "rgb(var(--wr-text) / <alpha-value>)",
  muted: "rgb(var(--wr-muted) / <alpha-value>)",
  primary: "rgb(var(--wr-primary) / <alpha-value>)",
  "primary-contrast": "rgb(var(--wr-primary-contrast) / <alpha-value>)",
  accent: "rgb(var(--wr-accent) / <alpha-value>)",
  danger: "rgb(var(--wr-danger) / <alpha-value>)",
  warning: "rgb(var(--wr-warning) / <alpha-value>)",
  success: "rgb(var(--wr-success) / <alpha-value>)",
  border: "rgb(var(--wr-border) / <alpha-value>)",
  ring: "rgb(var(--wr-ring) / <alpha-value>)"
};
const tailwindTheme = {
  colors: {
    background: tailwindColorVariables.bg,
    panel: tailwindColorVariables.panel,
    foreground: tailwindColorVariables.text,
    text: tailwindColorVariables.text,
    muted: {
      DEFAULT: tailwindColorVariables.muted,
      foreground: "rgb(var(--wr-text) / 0.65)"
    },
    primary: {
      DEFAULT: tailwindColorVariables.primary,
      foreground: tailwindColorVariables["primary-contrast"]
    },
    accent: {
      DEFAULT: tailwindColorVariables.accent,
      foreground: tailwindColorVariables["primary-contrast"]
    },
    success: {
      DEFAULT: tailwindColorVariables.success,
      foreground: "rgb(255 255 255 / <alpha-value>)"
    },
    warning: {
      DEFAULT: tailwindColorVariables.warning,
      foreground: "rgb(15 23 42 / <alpha-value>)"
    },
    danger: {
      DEFAULT: tailwindColorVariables.danger,
      foreground: "rgb(255 255 255 / <alpha-value>)"
    },
    border: tailwindColorVariables.border,
    ring: tailwindColorVariables.ring
  },
  borderColor: {
    DEFAULT: tailwindColorVariables.border
  },
  ringColor: {
    DEFAULT: tailwindColorVariables.ring
  },
  textColor: {
    DEFAULT: tailwindColorVariables.text
  },
  backgroundColor: {
    DEFAULT: tailwindColorVariables.bg,
    panel: tailwindColorVariables.panel
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  tailwindColorVariables,
  tailwindTheme
});
