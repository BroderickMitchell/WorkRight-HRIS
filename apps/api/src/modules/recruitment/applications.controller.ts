import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query('requisition_id') requisitionId?: string) {
    const where: any = {};
    if (requisitionId) where.requisitionId = requisitionId;
    return (this.prisma as any).application.findMany({ where, orderBy: { appliedAt: 'desc' }, include: { candidate: true } });
  }

  @Patch(':id/move_stage')
  async move(@Param('id') id: string, @Body() body: { stage: 'APPLICATION'|'INTERVIEW'|'OFFER'|'ONBOARDING'|'UNSUCCESSFUL' }) {
    const app = await (this.prisma as any).application.findUnique({ where: { id }, include: { interviews: true, offers: true } });
    if (!app) throw new BadRequestException('Application not found');
    // Very light business rules: require interview outcome before Offer, and offer accepted before Onboarding
    if (body.stage === 'OFFER') {
      if (!app.interviews || app.interviews.length === 0) throw new BadRequestException('Add interview outcome first');
    }
    if (body.stage === 'ONBOARDING') {
      if (!app.offers || app.offers.length === 0) throw new BadRequestException('Issue offer first');
    }
    return (this.prisma as any).application.update({ where: { id }, data: { currentStage: body.stage } });
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { reasonId: string; note?: string; messageOverride?: string }) {
    const app = await (this.prisma as any).application.findUnique({ where: { id } });
    if (!app) throw new BadRequestException('Application not found');
    await (this.prisma as any).applicationRejection.create({ data: ({ applicationId: id, reasonId: body.reasonId, internalNotes: body.note ?? null, candidateMessageOverride: body.messageOverride ?? null } as any) });
    return (this.prisma as any).application.update({ where: { id }, data: { currentStage: 'UNSUCCESSFUL', candidateVisibleStatusText: 'Application unsuccessful' } });
  }
}

