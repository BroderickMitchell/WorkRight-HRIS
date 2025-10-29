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
var stat_grid_exports = {};
__export(stat_grid_exports, {
  StatGrid: () => StatGrid
});
module.exports = __toCommonJS(stat_grid_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_cn = require("../utils/cn");
function StatGrid({ children, columns = 4, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: (0, import_cn.cn)("grid gap-4", gridCols(columns), className), children });
}
function gridCols(columns) {
  switch (columns) {
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
    default:
      return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StatGrid
});
