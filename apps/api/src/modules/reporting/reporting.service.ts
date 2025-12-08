import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma.service.js';

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  async headcountDashboard() {
    const tenantId = this.cls.get('tenantId');
    const total = await this.prisma.employee.count({ where: { tenantId, terminatedAt: null } });
    const byDepartment = await this.prisma.department.findMany({
      where: { tenantId },
      include: {
        _count: { select: { employees: true } }
      }
    });
    return { total, byDepartment };
  }

  async leaveDashboard() {
    const tenantId = this.cls.get('tenantId');
    const outstanding = await this.prisma.leaveRequest.count({
      where: { tenantId, status: 'PENDING' }
    });
    const balances = await this.prisma.leaveBalance.findMany({
      where: { tenantId },
      include: { leaveType: true }
    });
    return { outstanding, balances };
  }

  async adHoc(entity: string) {
    const tenantId = this.cls.get('tenantId');
    switch (entity) {
      case 'employees':
        return this.prisma.employee.findMany({
          where: { tenantId },
          include: { position: true, department: true }
        });
      case 'goals':
        return this.prisma.goal.findMany({ where: { tenantId }, include: { owner: true } });
      case 'leave':
        return this.prisma.leaveRequest.findMany({ where: { tenantId }, include: { employee: true } });
      default:
        return [];
    }
  }

  private toCsv(rows: any[], headers: string[]): string {
    const escape = (v: any) => {
      if (v == null) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push(headers.map((h) => escape(r[h])).join(','));
    }
    return lines.join('\n');
  }

  async positionsMasterCsv(): Promise<string> {
    const tenantId = this.cls.get('tenantId');
    const items = await this.prisma.position.findMany({
      where: { tenantId },
      include: {
        department: true,
        location: true,
        assignments: {
          where: {
            startDate: { lte: new Date() },
            OR: [{ endDate: null }, { endDate: { gte: new Date() } }]
          },
          include: { employee: { select: { givenName: true, familyName: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const vacancyStatus = (position: { isActive: boolean; headcount: number; assignments: { startDate: Date; endDate: Date | null }[] }) => {
      if (!position.isActive) return 'inactive';
      const active = position.assignments.filter((assignment) => assignment.startDate <= new Date() && (!assignment.endDate || assignment.endDate >= new Date()));
      if (active.length === 0) return 'open';
      if (active.length > position.headcount) return 'overfilled';
      if (active.length === position.headcount) return 'filled';
      return 'open';
    };
    const rows = items.map((position) => ({
      position_id: position.positionId,
      title: position.title,
      department: position.department?.name ?? '',
      location: position.location?.name ?? '',
      headcount: position.headcount,
      vacancy_status: vacancyStatus(position),
      occupants: position.assignments
        .map((assignment) => `${assignment.employee?.givenName ?? ''} ${assignment.employee?.familyName ?? ''}`.trim())
        .filter((name) => name.length > 0)
        .join('; '),
      budgeted_fte: position.budgetedFte ? Number(position.budgetedFte).toFixed(2) : '',
      budgeted_salary: position.budgetedSalary ? Number(position.budgetedSalary).toFixed(2) : '',
      is_active: position.isActive ? 'yes' : 'no',
      parent_position_id: position.parentPositionId ?? ''
    }));
    return this.toCsv(rows, [
      'position_id',
      'title',
      'department',
      'location',
      'headcount',
      'vacancy_status',
      'occupants',
      'budgeted_fte',
      'budgeted_salary',
      'is_active',
      'parent_position_id'
    ]);
  }

  async positionsCycleTimesCsv(): Promise<string> {
    const tenantId = this.cls.get('tenantId');
    const positions = await this.prisma.position.findMany({
      where: { tenantId },
      include: {
        assignments: { include: { employee: true }, orderBy: { startDate: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    const rows = positions.map((position) => {
      const firstAssignment = position.assignments[0];
      const filledAt = firstAssignment ? firstAssignment.startDate : null;
      const daysToFill = filledAt ? Math.max(0, Math.round((+filledAt - +position.createdAt) / (1000 * 60 * 60 * 24))) : '';
      return {
        position_id: position.positionId,
        title: position.title,
        created_at: position.createdAt.toISOString().slice(0, 10),
        first_assignment_at: filledAt ? filledAt.toISOString().slice(0, 10) : '',
        days_to_fill: daysToFill,
        headcount: position.headcount,
        assignments_created: position.assignments.length
      };
    });
    return this.toCsv(rows, ['position_id', 'title', 'created_at', 'first_assignment_at', 'days_to_fill', 'headcount', 'assignments_created']);
  }

  async positionsSummaryCsv(): Promise<string> {
    const tenantId = this.cls.get('tenantId');
    const departments = await this.prisma.department.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    const positions = await this.prisma.position.findMany({
      where: { tenantId },
      include: {
        assignments: {
          where: {
            startDate: { lte: new Date() },
            OR: [{ endDate: null }, { endDate: { gte: new Date() } }]
          }
        }
      }
    });
    const byDept = new Map<string, { department: string; total: number; open: number; filled: number; overfilled: number }>();
    for (const department of departments) {
      byDept.set(department.id, { department: department.name, total: 0, open: 0, filled: 0, overfilled: 0 });
    }
    const determineStatus = (position: typeof positions[number]) => {
      if (!position.isActive) return 'inactive';
      const active = position.assignments.filter((assignment) => assignment.startDate <= new Date() && (!assignment.endDate || assignment.endDate >= new Date()));
      if (active.length === 0) return 'open';
      if (active.length > position.headcount) return 'overfilled';
      if (active.length === position.headcount) return 'filled';
      return 'open';
    };
    for (const position of positions) {
      const key = position.departmentId ?? 'unknown';
      if (!byDept.has(key)) {
        byDept.set(key, { department: 'Unknown', total: 0, open: 0, filled: 0, overfilled: 0 });
      }
      const summary = byDept.get(key)!;
      summary.total += 1;
      const status = determineStatus(position);
      if (status === 'open') summary.open += 1;
      if (status === 'filled') summary.filled += 1;
      if (status === 'overfilled') summary.overfilled += 1;
    }
    const rows = Array.from(byDept.values());
    return this.toCsv(rows, ['department', 'total', 'open', 'filled', 'overfilled']);
  }
}
