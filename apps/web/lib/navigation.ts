import { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Compass,
  FilePieChart,
  GaugeCircle,
  GraduationCap,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Users2
} from 'lucide-react';
import { getTenantSettings } from './tenant';

type FeatureFlag = string;

export type IconName =
  | 'dashboard'
  | 'people'
  | 'recruitment'
  | 'operations'
  | 'learning'
  | 'performance'
  | 'payroll'
  | 'reports'
  | 'admin'
  | 'workflow'
  | 'compliance'
  | 'analytics';

export const NAV_ICON_MAP: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  people: Users2,
  recruitment: BriefcaseBusiness,
  operations: Compass,
  learning: GraduationCap,
  performance: GaugeCircle,
  payroll: Building2,
  reports: FilePieChart,
  admin: Settings2,
  workflow: ClipboardList,
  compliance: ShieldCheck,
  analytics: BarChart3
};

export interface NavItem {
  href: string;
  label: string;
  description?: string;
  icon?: IconName;
  badge?: string;
  featureFlag?: FeatureFlag;
}

export interface NavSection {
  id: string;
  label: string;
  icon: IconName;
  items: NavItem[];
  featureFlag?: FeatureFlag;
}

function isFlagEnabled(flag: FeatureFlag | undefined, tenant = getTenantSettings()) {
  if (!flag) return true;
  const flags = tenant.featureFlags as Record<string, boolean> | undefined;
  return Boolean(flags?.[flag]);
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'dashboard',
    items: [
      { href: '/dashboard', label: 'Executive Dashboard', icon: 'dashboard' }
    ]
  },
  {
    id: 'people',
    label: 'People',
    icon: 'people',
    items: [
      { href: '/employees', label: 'Employee Directory', icon: 'people' },
      { href: '/leave', label: 'Leave & Time', icon: 'operations' }
    ]
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: 'recruitment',
    items: [
      { href: '/jobs', label: 'Job Requisitions', icon: 'recruitment' },
      { href: '/workflows', label: 'Workflow Library', icon: 'workflow' }
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: 'operations',
    items: [
      { href: '/workflows/instances', label: 'Workflow Instances', icon: 'workflow' }
    ]
  },
  {
    id: 'reports',
    label: 'Insights & Reports',
    icon: 'reports',
    items: [
      { href: '/reports', label: 'Analytics', icon: 'analytics' }
    ]
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: 'admin',
    items: [
      { href: '/settings', label: 'Tenant Settings', icon: 'admin', featureFlag: 'canManageSettings' }
    ],
    featureFlag: 'canManageSettings'
  }
];

export function getNavigationSections(tenant = getTenantSettings()): NavSection[] {
  return NAV_SECTIONS.filter((section) => isFlagEnabled(section.featureFlag, tenant)).map((section) => ({
    ...section,
    items: section.items.filter((item) => isFlagEnabled(item.featureFlag, tenant))
  }));
}

export function resolveIcon(name?: IconName): LucideIcon | null {
  if (!name) return null;
  return NAV_ICON_MAP[name];
}
