import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';

@Controller()
export class JobsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('jobs')
  async listJobs(@Query('q') q?: string, @Query('location') location?: string, @Query('workType') workType?: string) {
    const postings = await (this.prisma as any).jobPosting.findMany({
      where: { status: 'active' },
      include: { requisition: true },
      orderBy: { createdAt: 'desc' }
    });
    const items = postings.filter((p: any) => {
      if (q && !(p.requisition?.title ?? p.requisition?.description ?? '').toLowerCase().includes(String(q).toLowerCase())) return false;
      if (location && (p.requisition?.location ?? '').toLowerCase() !== String(location).toLowerCase()) return false;
      if (workType && (p.requisition?.workType ?? '').toLowerCase() !== String(workType).toLowerCase()) return false;
      return true;
    }).map((p: any) => ({ slug: p.externalSlug, title: p.requisition?.title ?? '', location: p.requisition?.location ?? '', workType: p.requisition?.workType ?? '', createdAt: p.createdAt }));
    return { items };
  }

  @Get('jobs/:slug')
  async getJob(@Param('slug') slug: string) {
    const p = await (this.prisma as any).jobPosting.findUnique({ where: { externalSlug: slug }, include: { requisition: true } });
    if (!p || p.status !== 'active') return null;
    return {
      slug,
      title: p.requisition?.title ?? '',
      description: p.requisition?.description ?? '',
      selectionCriteria: p.requisition?.selectionCriteria ?? [],
      location: p.requisition?.location ?? '',
      workType: p.requisition?.workType ?? '',
      closingDate: p.requisition?.closingDate ?? null
    };
  }

  @Post('jobs/:slug/apply')
  async apply(@Param('slug') slug: string, @Body() body: { email: string; firstName: string; lastName: string; phone?: string }) {
    const p = await (this.prisma as any).jobPosting.findUnique({ where: { externalSlug: slug } });
    if (!p || p.status !== 'active') throw new Error('Posting closed');
    let cand = await (this.prisma as any).candidate.findUnique({ where: { email: body.email } });
    if (!cand) {
      cand = await (this.prisma as any).candidate.create({ data: ({ email: body.email, firstName: body.firstName, lastName: body.lastName, phone: body.phone } as any) });
    }
    const application = await (this.prisma as any).application.create({ data: ({ candidateId: cand.id, requisitionId: p.requisitionId } as any) });
    return { ok: true, applicationId: application.id };
  }
}

