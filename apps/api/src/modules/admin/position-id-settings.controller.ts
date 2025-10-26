import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { Roles } from '../../common/auth/roles.decorator.js';

@Controller('admin/position_id_settings')
export class PositionIdSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const counters = await (this.prisma as any).positionIdCounter.findMany({ include: { department: true } });
    return counters.map((c: any) => ({ departmentId: c.departmentId, department: c.department?.name ?? '', prefix: c.department?.codePrefix ?? '', nextNumber: c.nextNumber, width: c.width, hyphenStyle: c.hyphenStyle }));
  }

  @Patch(':departmentId')
  @Roles('HR_ADMIN')
  async update(@Param('departmentId') departmentId: string, @Body() body: { width?: number; hyphenStyle?: boolean; nextNumber?: number }) {
    const data: any = {};
    if (typeof body.width === 'number') data.width = body.width;
    if (typeof body.hyphenStyle === 'boolean') data.hyphenStyle = body.hyphenStyle;
    if (typeof body.nextNumber === 'number') data.nextNumber = body.nextNumber;
    await (this.prisma as any).positionIdCounter.upsert({ where: { departmentId }, update: data, create: ({ departmentId, ...data } as any) });
    return (this.prisma as any).positionIdCounter.findUnique({ where: { departmentId } });
  }
}

