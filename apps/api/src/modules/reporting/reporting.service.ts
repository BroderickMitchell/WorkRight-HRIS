import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async headcountDashboard() {
    const total = await this.prisma.employee.count({ where: { terminatedAt: null } });
    const byDepartment = await this.prisma.department.findMany({
      include: {
        _count: { select: { employees: true } }
      }
    });
    return { total, byDepartment };
  }

  async leaveDashboard() {
    const outstanding = await this.prisma.leaveRequest.count({
      where: { status: 'PENDING' }
    });
    const balances = await this.prisma.leaveBalance.findMany({
      include: { leaveType: true }
    });
    return { outstanding, balances };
  }

  async adHoc(entity: string) {
    switch (entity) {
      case 'employees':
        return this.prisma.employee.findMany({
          include: { position: true, department: true }
        });
      case 'goals':
        return this.prisma.goal.findMany({ include: { owner: true } });
      case 'leave':
        return this.prisma.leaveRequest.findMany({ include: { employee: true } });
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
    const items = await (this.prisma as any).position.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' }
    });
    const rows = items.map((p: any) => ({
      position_id: p.positionHumanId,
      title: p.title,
      department: p.department?.name ?? '',
      employment_type: p.employmentType,
      work_type: p.workType,
      fte: p.fte,
      location: p.location ?? '',
      budget_status: p.budgetStatus,
      status: p.status,
      effective_from: p.effectiveFrom?.toISOString()?.slice(0,10) ?? '',
      effective_to: p.effectiveTo?.toISOString()?.slice(0,10) ?? ''
    }));
    return this.toCsv(rows, ['position_id','title','department','employment_type','work_type','fte','location','budget_status','status','effective_from','effective_to']);
  }

  async positionsCycleTimesCsv(): Promise<string> {
    const positions = await (this.prisma as any).position.findMany({ orderBy: { createdAt: 'desc' } });
    const approvals = await (this.prisma as any).positionApproval.findMany({ include: { step: true } });
    const byPos = new Map<string, any[]>();
    for (const a of approvals) {
      if (!byPos.has(a.positionId)) byPos.set(a.positionId, []);
      byPos.get(a.positionId)!.push(a);
    }
    const rows = positions.map((p: any) => {
      const list = (byPos.get(p.id) ?? []).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
      const submittedAt = list[0]?.createdAt ?? p.createdAt;
      const lastApproved = list.filter((x) => x.action === 'APPROVED').sort((a, b) => +new Date(a.actedAt ?? 0) - +new Date(b.actedAt ?? 0)).slice(-1)[0]?.actedAt;
      const days = lastApproved ? Math.round((+new Date(lastApproved) - +new Date(submittedAt)) / (1000*60*60*24)) : '';
      return {
        position_id: p.positionHumanId,
        title: p.title,
        submitted_at: new Date(submittedAt).toISOString().slice(0,10),
        approved_at: lastApproved ? new Date(lastApproved).toISOString().slice(0,10) : '',
        cycle_days: days
      } as any;
    });
    return this.toCsv(rows as any[], ['position_id','title','submitted_at','approved_at','cycle_days']);
  }

  async positionsSummaryCsv(): Promise<string> {
    const departments = await (this.prisma as any).department.findMany({ orderBy: { name: 'asc' } });
    const positions = await (this.prisma as any).position.findMany({});
    const byDept = new Map<string, any>();
    for (const d of departments) byDept.set(d.id, { department: d.name, pending: 0, active: 0, budgeted: 0, unbudgeted: 0 });
    for (const p of positions) {
      const key = p.departmentId ?? 'unknown';
      const rec = byDept.get(key) || { department: 'Unknown', pending: 0, active: 0, budgeted: 0, unbudgeted: 0 };
      if (p.status === 'PENDING') rec.pending++;
      if (p.status === 'ACTIVE') rec.active++;
      if (p.budgetStatus === 'BUDGETED') rec.budgeted++;
      if (p.budgetStatus === 'UNBUDGETED') rec.unbudgeted++;
      byDept.set(key, rec);
    }
    const rows = Array.from(byDept.values());
    return this.toCsv(rows, ['department','pending','active','budgeted','unbudgeted']);
  }
}
