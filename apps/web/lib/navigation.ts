import { LucideIcon } from 'lucide-react';
import { BriefcaseBusiness, Building2, FilePieChart, LayoutDashboard, Settings2, Users2 } from 'lucide-react';
import { getTenantSettings } from './tenant';

type FeatureFlag = string;

export type IconName = 'dashboard' | 'people' | 'recruitment' | 'payroll' | 'reports' | 'settings';

export const NAV_ICON_MAP: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  people: Users2,
  recruitment: BriefcaseBusiness,
  payroll: Building2,
  reports: FilePieChart,
  settings: Settings2
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
    items: [{ href: '/dashboard', label: 'Executive Dashboard', icon: 'dashboard' }]
  },
  {
    id: 'people',
    label: 'People',
    icon: 'people',
    items: [
      { href: '/employees', label: 'Employee Directory', icon: 'people' },
      { href: '/leave', label: 'Leave & Time', icon: 'people' }
    ]
  },
  {
    id: 'recruitment',
    label: 'Hiring',
    icon: 'recruitment',
    items: [
      { href: '/jobs', label: 'Job Requisitions', icon: 'recruitment' },
      { href: '/workflows', label: 'Workflow Library', icon: 'recruitment' }
    ]
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: 'payroll',
    items: [{ href: '/payroll', label: 'Payroll Runs', icon: 'payroll' }]
  },
  {
    id: 'reports',
    label: 'Insights & Reports',
    icon: 'reports',
    items: [{ href: '/reports', label: 'Analytics', icon: 'reports' }]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    items: [
      { href: '/settings', label: 'Workspace Settings', icon: 'settings', featureFlag: 'canManageSettings' },
      { href: '/settings/tenant', label: 'Tenant Settings', icon: 'settings', featureFlag: 'canManageSettings' }
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
