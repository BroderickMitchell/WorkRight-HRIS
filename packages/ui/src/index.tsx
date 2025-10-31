// Ensure all exports are treated as client components when consumed in Next.js
'use client';

// Utilities
export { cn } from './utils/cn';

// Atoms
export { Button } from './components/button';
export { Badge } from './components/badge';

// Cards
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/card';

// Data display
export { EmptyState } from './components/empty-state';
export { KpiCard } from './components/kpi-card';
export { StatGrid } from './components/stat-grid';
export type { DataTableProps } from './components/data-table';

// Page chrome
export { PageHeader, PageActions } from './components/page-header';
export { Toolbar } from './components/toolbar';
export type { Density } from './components/toolbar';

// Surfaces / Layout
export { Drawer } from './components/drawer';
export { Modal } from './components/modal';

// Forms
export { FormShell } from './components/form-shell';

// Tokens
export {
  tailwindTheme,
  tailwindColorVariables,
  type TailwindTheme,
} from './tokens/tailwind-theme';
