import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { CreateLeaveRequestDto } from './leave.dto.js';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  requestLeave(dto: CreateLeaveRequestDto) {
    return this.prisma.leaveRequest.create({
      data: ({
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
    return this.prisma.leaveRequest.findMany({
      where: employeeId ? { employeeId } : undefined,
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
    return this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true, approvers: true }
    });
  }

  getBalances(employeeId: string) {
    return this.prisma.leaveBalance.findMany({
      where: { employeeId },
      include: { leaveType: true }
    });
  }
}
