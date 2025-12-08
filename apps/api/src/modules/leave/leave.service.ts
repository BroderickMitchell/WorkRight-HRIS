import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma.service.js';
import { CreateLeaveRequestDto } from './leave.dto.js';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  requestLeave(dto: CreateLeaveRequestDto) {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.leaveRequest.create({
      data: ({
        tenantId,
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        notes: dto.notes
      } as any),
      include: {
        employee: true,
        approvers: true
      }
    });
  }

  listRequests(employeeId?: string) {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.leaveRequest.findMany({
      where: employeeId ? { tenantId, employeeId } : { tenantId },
      orderBy: { startDate: 'desc' },
      take: 25,
      include: {
        employee: {
          select: { id: true, givenName: true, familyName: true, email: true }
        },
        leaveType: true
      }
    });
  }

  getLeave(id: string) {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.leaveRequest.findFirst({
      where: { id, tenantId },
      include: { employee: true, approvers: true }
    });
  }

  getBalances(employeeId: string) {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.leaveBalance.findMany({
      where: { tenantId, employeeId },
      include: { leaveType: true }
    });
  }
}
