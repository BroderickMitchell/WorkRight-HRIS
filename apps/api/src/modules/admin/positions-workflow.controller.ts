import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma.service.js';
import { Roles } from '../../common/auth/roles.decorator.js';

@Controller('admin/approval_workflows')
export class PositionsWorkflowController {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  @Get('positions')
  async getWorkflow() {
    const tenantId = this.cls.get('tenantId');
    const steps = await (this.prisma as any).approvalStep.findMany({
      where: { tenantId },
      orderBy: { sequence: 'asc' }
    });
    return steps;
  }

  @Patch('positions')
  @Roles('HR_ADMIN')
  async setWorkflow(@Body() body: { steps: { name: string; roleRequired: string; sequence: number; slaDays: number }[] }) {
    const tenantId = this.cls.get('tenantId');
    await (this.prisma as any).approvalStep.deleteMany({ where: { tenantId } });
    for (const s of (body.steps ?? [])) {
      await (this.prisma as any).approvalStep.create({
        data: ({
          tenantId,
          name: s.name,
          roleRequired: s.roleRequired,
          sequence: s.sequence,
          slaDays: s.slaDays
        } as any)
      });
    }
    return this.getWorkflow();
  }
}

