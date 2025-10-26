import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';

@Controller('requisitions')
export class RequisitionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() body: any) {
    const position = await (this.prisma as any).position.findUnique({ where: { id: body.positionId } });
    if (!position) throw new BadRequestException('Position not found');
    if (String(position.status).toUpperCase() !== 'ACTIVE') throw new BadRequestException('Position is not approved/active');
    const data = {
      positionId: body.positionId,
      title: body.title ?? position.title,
      vacancyCount: body.vacancyCount ?? 1,
      employmentType: body.employmentType ?? 'Full-time',
      workType: body.workType ?? 'Permanent',
      salaryRange: body.salaryRange ?? null,
      location: body.location ?? null,
      closingDate: body.closingDate ? new Date(body.closingDate) : null,
      description: body.description ?? null,
      selectionCriteria: body.selectionCriteria ?? []
    } as any;
    const rec = await (this.prisma as any).requisition.create({ data });
    return rec;
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return (this.prisma as any).requisition.findUnique({ where: { id }, include: { postings: true, position: true } });
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() body: any) {
    const req = await (this.prisma as any).requisition.findUnique({ where: { id } });
    if (!req) throw new BadRequestException('Requisition not found');
    if (req.status !== 'DRAFT') throw new BadRequestException('Edits only allowed in Draft');
    const data: any = {};
    for (const k of ['title','vacancyCount','employmentType','workType','salaryRange','location','description']) {
      if (k in body) (data as any)[k] = body[k];
    }
    if (body.closingDate !== undefined) data.closingDate = body.closingDate ? new Date(body.closingDate) : null;
    if (body.selectionCriteria !== undefined) data.selectionCriteria = body.selectionCriteria;
    return (this.prisma as any).requisition.update({ where: { id }, data });
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string) {
    const req = await (this.prisma as any).requisition.findUnique({ where: { id } });
    if (!req) throw new BadRequestException('Requisition not found');
    if (req.status !== 'DRAFT') return req;
    return (this.prisma as any).requisition.update({ where: { id }, data: { status: 'SUBMITTED', approvalsAudit: { action: 'SUBMITTED', at: new Date().toISOString() } } });
  }

  @Post(':id/postings')
  async postExternally(@Param('id') id: string, @Body() body: { slug: string; visibility?: string; channels?: string[] }) {
    const req = await (this.prisma as any).requisition.findUnique({ where: { id } });
    if (!req) throw new BadRequestException('Requisition not found');
    if (req.status === 'CLOSED') throw new BadRequestException('Requisition closed');
    const posting = await (this.prisma as any).jobPosting.create({ data: ({ requisitionId: id, externalSlug: body.slug, visibility: body.visibility ?? 'public', channels: body.channels ?? [] } as any) });
    await (this.prisma as any).requisition.update({ where: { id }, data: { status: 'POSTED' } });
    return posting;
  }
}

