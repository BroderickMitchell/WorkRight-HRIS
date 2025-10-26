import { Body, Controller, Get, Patch } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { Roles } from '../../common/auth/roles.decorator.js';

@Controller('admin/approval_workflows')
export class PositionsWorkflowController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('positions')
  async getWorkflow() {
    const steps = await (this.prisma as any).approvalStep.findMany({ orderBy: { sequence: 'asc' } });
    return steps;
  }

  @Patch('positions')
  @Roles('HR_ADMIN')
  async setWorkflow(@Body() body: { steps: { name: string; roleRequired: string; sequence: number; slaDays: number }[] }) {
    await (this.prisma as any).approvalStep.deleteMany({});
    for (const s of (body.steps ?? [])) {
      await (this.prisma as any).approvalStep.create({ data: ({ name: s.name, roleRequired: s.roleRequired, sequence: s.sequence, slaDays: s.slaDays } as any) });
    }
    return this.getWorkflow();
  }
}

