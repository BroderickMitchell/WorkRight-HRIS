import * as fs from 'fs';
import path from 'path';

export type NavItem = { href: string; label: string };
export type NavSection = { section: string; items: NavItem[] };

// Configure logical groupings for sidebar sections
// Any page that doesn't match will fall back to "Other"
const GROUPS: Array<{ name: string; match: (href: string) => boolean }> = [
  { name: 'Overview', match: (href) => href === '/dashboard' },
  { name: 'Profile', match: (href) => href === '/employees' || href.startsWith('/org-chart') },
  { name: 'Recruitment', match: (href) => href.startsWith('/jobs') || href.startsWith('/positions') || href.startsWith('/workflows') },
  { name: 'Payroll', match: (href) => href.startsWith('/payroll') || href.startsWith('/rosters') },
  { name: 'Learning', match: (href) => href.startsWith('/courses') },
  { name: 'Performance', match: (href) => href.startsWith('/goals') },
  { name: 'Operations', match: (href) => href.startsWith('/leave') || href.startsWith('/travel') || href.startsWith('/accommodation') },
  { name: 'Reporting', match: (href) => href.startsWith('/reports') },
  { name: 'Settings', match: (href) => href.startsWith('/settings') },
];

const EXCLUDED_DIRS = new Set<string>([
  'components',
  'lib',
  '__tests__',
]);

function isRouteGroup(name: string) {
  return name.startsWith('(') && name.endsWith(')');
}

function isDynamicSegment(name: string) {
  return name.startsWith('[') && name.endsWith(']');
}

function toTitleCase(segment: string): string {
  if (!segment) return '';
  const special: Record<string, string> = {
    'ids': 'IDs',
  };
  if (special[segment.toLowerCase()]) return special[segment.toLowerCase()];
  return segment
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function labelFromHref(href: string): string {
  if (href === '/dashboard') return 'Dashboard';
  if (href === '/employees') return 'Directory';
  if (href === '/org-chart') return 'Org Chart';
  if (href === '/payroll') return 'Payroll';
  if (href === '/reports') return 'Reporting';
  if (href === '/courses') return 'Learning';
  // For nested routes like /settings/ids => "Settings / IDs"
  const parts = href.split('/').filter(Boolean);
  if (parts.length === 1) return toTitleCase(parts[0]);
  const [first, ...rest] = parts;
  return `${toTitleCase(first)} / ${rest.map(toTitleCase).join(' / ')}`;
}

function findAppDir(): string {
  // In the @workright/web app, process.cwd() should be the app root
  // so the app/ folder is at cwd/app
  const candidate = path.join(process.cwd(), 'app');
  try {
    const stat = fs.statSync(candidate);
    if (stat.isDirectory()) return candidate;
  } catch (_) {
    // ignore
  }
  return candidate;
}

function collectPages(dir: string, urlSegments: string[] = [], pages = new Set<string>()): Set<string> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const name = entry.name;
      if (EXCLUDED_DIRS.has(name)) continue;
      if (isRouteGroup(name)) {
        // Do not add group to URL
        collectPages(path.join(dir, name), urlSegments, pages);
        continue;
      }
      if (isDynamicSegment(name)) {
        // Skip dynamic segments entirely for sidebar discovery
        // e.g. /employees/[id]/documents should not appear as /employees/documents
        continue;
      }
      collectPages(path.join(dir, name), [...urlSegments, name], pages);
    } else if (entry.isFile()) {
      if (entry.name === 'page.tsx') {
        const href = '/' + urlSegments.join('/');
        // Exclude root redirecting index
        if (href !== '/') {
          pages.add(href);
        }
      }
    }
  }
  return pages;
}

export function getAllPages(): string[] {
  const appDir = findAppDir();
  const pages = Array.from(collectPages(appDir));
  // Sort by depth then alpha for stable UI
  pages.sort((a, b) => {
    const da = a.split('/').length;
    const db = b.split('/').length;
    if (da !== db) return da - db;
    return a.localeCompare(b);
  });
  return pages;
}

export function getSidebarNav(): NavSection[] {
  const pages = getAllPages();

  // Only show index pages or shallow routes in the sidebar by default
  // e.g. include "/settings" and "/settings/ids", but not deeply nested dynamic pages
  const filtered = pages.filter((href) => {
    // Include top-level and second-level static pages
    const parts = href.split('/').filter(Boolean);
    const depth = parts.length;
    return depth <= 2;
  });

  const sectionMap = new Map<string, NavItem[]>();
  const unmatched: NavItem[] = [];

  for (const href of filtered) {
    const item: NavItem = { href, label: labelFromHref(href) };
    const group = GROUPS.find((g) => g.match(href));
    if (group) {
      const arr = sectionMap.get(group.name) ?? [];
      arr.push(item);
      sectionMap.set(group.name, arr);
    } else {
      unmatched.push(item);
    }
  }

  const sections: NavSection[] = [];
  // Maintain GROUPS order
  for (const g of GROUPS) {
    const items = sectionMap.get(g.name);
    if (items && items.length > 0) {
      // sort items alphabetically within a section
      items.sort((a, b) => a.label.localeCompare(b.label));
      sections.push({ section: g.name, items });
    }
  }
  if (unmatched.length > 0) {
    unmatched.sort((a, b) => a.label.localeCompare(b.label));
    sections.push({ section: 'Other', items: unmatched });
  }
  return sections;
}
