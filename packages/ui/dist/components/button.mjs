import { jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import {
  cloneElement,
  forwardRef,
  isValidElement
} from "react";
import { cn } from "../utils/cn";
const buttonVariants = cva(
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
const Button = forwardRef(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const composedClassName = cn(buttonVariants({ variant, size }), className);
    if (asChild && isValidElement(children)) {
      return cloneElement(children, {
        ref,
        className: cn(composedClassName, children.props?.className),
        ...props
      });
    }
    return /* @__PURE__ */ jsx("button", { ref, className: composedClassName, ...props, children });
  }
);
Button.displayName = "Button";
export {
  Button
};
