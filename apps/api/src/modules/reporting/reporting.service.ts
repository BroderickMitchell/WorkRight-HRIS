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
}
