/**
 * Tailwind theme bridge for WorkRight design tokens.
 *
 * Usage:
 * ```ts
 * import { tailwindTheme } from '@workright/ui/tokens';
 *
 * export const tailwindConfig = {
 *   theme: {
 *     extend: tailwindTheme,
 *   },
 * };
 * ```
 */
export const tailwindColorVariables = {
  bg: 'rgb(var(--wr-bg) / <alpha-value>)',
  panel: 'rgb(var(--wr-panel) / <alpha-value>)',
  text: 'rgb(var(--wr-text) / <alpha-value>)',
  muted: 'rgb(var(--wr-muted) / <alpha-value>)',
  primary: 'rgb(var(--wr-primary) / <alpha-value>)',
  'primary-contrast': 'rgb(var(--wr-primary-contrast) / <alpha-value>)',
  accent: 'rgb(var(--wr-accent) / <alpha-value>)',
  danger: 'rgb(var(--wr-danger) / <alpha-value>)',
  warning: 'rgb(var(--wr-warning) / <alpha-value>)',
  success: 'rgb(var(--wr-success) / <alpha-value>)',
  border: 'rgb(var(--wr-border) / <alpha-value>)',
  ring: 'rgb(var(--wr-ring) / <alpha-value>)'
} as const;

export const tailwindTheme = {
  colors: {
    background: tailwindColorVariables.bg,
    panel: tailwindColorVariables.panel,
    foreground: tailwindColorVariables.text,
    text: tailwindColorVariables.text,
    muted: {
      DEFAULT: tailwindColorVariables.muted,
      foreground: 'rgb(var(--wr-text) / 0.65)'
    },
    primary: {
      DEFAULT: tailwindColorVariables.primary,
      foreground: tailwindColorVariables['primary-contrast']
    },
    accent: {
      DEFAULT: tailwindColorVariables.accent,
      foreground: tailwindColorVariables['primary-contrast']
    },
    success: {
      DEFAULT: tailwindColorVariables.success,
      foreground: 'rgb(255 255 255 / <alpha-value>)'
    },
    warning: {
      DEFAULT: tailwindColorVariables.warning,
      foreground: 'rgb(15 23 42 / <alpha-value>)'
    },
    danger: {
      DEFAULT: tailwindColorVariables.danger,
      foreground: 'rgb(255 255 255 / <alpha-value>)'
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

export type TailwindTheme = typeof tailwindTheme;
