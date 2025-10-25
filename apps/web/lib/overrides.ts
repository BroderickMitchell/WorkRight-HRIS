import { Employee, sampleEmployees } from './sample-data';
import { getItem, setItem } from './store';

export type EmployeeOverride = Partial<Pick<Employee, 'name' | 'role' | 'department' | 'location' | 'email'>>;

const KEY = 'employeeOverrides';

export function getEmployeeOverrides(): Record<string, EmployeeOverride> {
  return getItem<Record<string, EmployeeOverride>>(KEY, {});
}

export function setEmployeeOverride(id: string, override: EmployeeOverride) {
  const map = getEmployeeOverrides();
  map[id] = { ...(map[id] ?? {}), ...override };
  setItem(KEY, map);
}

export function getEmployeeWithOverrides(id: string): Employee | undefined {
  const base = sampleEmployees.find((e) => e.id === id);
  if (!base) return undefined;
  const ov = getEmployeeOverrides()[id];
  return ov ? { ...base, ...ov } : base;
}

