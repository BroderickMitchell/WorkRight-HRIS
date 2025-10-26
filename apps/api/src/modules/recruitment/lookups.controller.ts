import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';

@Controller('lookups')
export class LookupsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('rejection_reasons')
  async listReasons() {
    return (this.prisma as any).rejectionReason.findMany({ orderBy: { code: 'asc' } });
  }

  @Post('rejection_reasons')
  async createReason(@Body() body: { code: string; label: string; visible_to_candidate?: boolean }) {
    return (this.prisma as any).rejectionReason.create({ data: ({ code: body.code, label: body.label, visibleToCandidate: body.visible_to_candidate ?? false } as any) });
  }
}

