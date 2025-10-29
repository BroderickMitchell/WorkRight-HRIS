import * as react from 'react';
import { ButtonHTMLAttributes } from 'react';
import * as class_variance_authority_dist_types from 'class-variance-authority/dist/types';
import { VariantProps } from 'class-variance-authority';

/**
 * WorkRight button primitive built on the semantic design tokens.
 *
 * Example:
 * ```tsx
 * <Button variant="secondary" size="sm">View details</Button>
 * ```
 */
declare const buttonVariants: (props?: ({
    variant?: "primary" | "secondary" | "ghost" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<HTMLButtonElement>>;

export { Button, ButtonProps };
