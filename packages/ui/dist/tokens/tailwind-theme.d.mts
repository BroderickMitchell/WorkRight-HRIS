/**
 * Tailwind theme bridge for WorkRight design tokens.
 *
 * Usage:
 * ```ts
 * import { tailwindTheme } from '@workright/ui/tokens';
 *
 * export default {
 *   theme: {
 *     extend: tailwindTheme,
 *   },
 * };
 * ```
 */
declare const tailwindColorVariables: {
    readonly bg: "rgb(var(--wr-bg) / <alpha-value>)";
    readonly panel: "rgb(var(--wr-panel) / <alpha-value>)";
    readonly text: "rgb(var(--wr-text) / <alpha-value>)";
    readonly muted: "rgb(var(--wr-muted) / <alpha-value>)";
    readonly primary: "rgb(var(--wr-primary) / <alpha-value>)";
    readonly 'primary-contrast': "rgb(var(--wr-primary-contrast) / <alpha-value>)";
    readonly accent: "rgb(var(--wr-accent) / <alpha-value>)";
    readonly danger: "rgb(var(--wr-danger) / <alpha-value>)";
    readonly warning: "rgb(var(--wr-warning) / <alpha-value>)";
    readonly success: "rgb(var(--wr-success) / <alpha-value>)";
    readonly border: "rgb(var(--wr-border) / <alpha-value>)";
    readonly ring: "rgb(var(--wr-ring) / <alpha-value>)";
};
declare const tailwindTheme: {
    colors: {
        background: "rgb(var(--wr-bg) / <alpha-value>)";
        panel: "rgb(var(--wr-panel) / <alpha-value>)";
        foreground: "rgb(var(--wr-text) / <alpha-value>)";
        text: "rgb(var(--wr-text) / <alpha-value>)";
        muted: {
            DEFAULT: "rgb(var(--wr-muted) / <alpha-value>)";
            foreground: string;
        };
        primary: {
            DEFAULT: "rgb(var(--wr-primary) / <alpha-value>)";
            foreground: "rgb(var(--wr-primary-contrast) / <alpha-value>)";
        };
        accent: {
            DEFAULT: "rgb(var(--wr-accent) / <alpha-value>)";
            foreground: "rgb(var(--wr-primary-contrast) / <alpha-value>)";
        };
        success: {
            DEFAULT: "rgb(var(--wr-success) / <alpha-value>)";
            foreground: string;
        };
        warning: {
            DEFAULT: "rgb(var(--wr-warning) / <alpha-value>)";
            foreground: string;
        };
        danger: {
            DEFAULT: "rgb(var(--wr-danger) / <alpha-value>)";
            foreground: string;
        };
        border: "rgb(var(--wr-border) / <alpha-value>)";
        ring: "rgb(var(--wr-ring) / <alpha-value>)";
    };
    borderColor: {
        DEFAULT: "rgb(var(--wr-border) / <alpha-value>)";
    };
    ringColor: {
        DEFAULT: "rgb(var(--wr-ring) / <alpha-value>)";
    };
    textColor: {
        DEFAULT: "rgb(var(--wr-text) / <alpha-value>)";
    };
    backgroundColor: {
        DEFAULT: "rgb(var(--wr-bg) / <alpha-value>)";
        panel: "rgb(var(--wr-panel) / <alpha-value>)";
    };
};
type TailwindTheme = typeof tailwindTheme;

export { TailwindTheme, tailwindColorVariables, tailwindTheme };
