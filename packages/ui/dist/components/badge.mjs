import { jsx } from "react/jsx-runtime";
import { cn } from "../utils/cn";
function Badge({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary",
        className
      ),
      ...props
    }
  );
}
export {
  Badge
};
