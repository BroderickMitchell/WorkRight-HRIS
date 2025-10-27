import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';

@Controller()
export class OrganizationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('departments')
  async listDepartments() {
    const items = await (this.prisma as any).department.findMany({ orderBy: { name: 'asc' } });
    return items.map((d: any) => ({ id: d.id, name: d.name, code_prefix: d.codePrefix ?? '', status: d.status ?? 'ACTIVE' }));
  }
}
