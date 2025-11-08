// src/modules/positions/positions.controller.ts
import { Controller, Get, Query, Body, Post, Param, Patch } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { OrgChartQueryDto } from './dto/org-chart-query.dto';
import { ListPositionsQueryDto } from './dto/list-positions-query.dto';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';
import { UpdatePositionConfigDto } from './dto/update-position-config.dto';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get('org-chart')
  orgChart(@Query() query: OrgChartQueryDto) {
    return this.positions.orgChart({ rootId: query.rootId });
  }

  @Get()
  list(@Query() query: ListPositionsQueryDto) {
    return this.positions.list({ q: query.q });
  }

  @Post('job-roles')
  createJobRole(@Body() dto: CreateJobRoleDto) {
    return this.positions.createJobRole({ name: dto.name });
  }

  @Patch('job-roles/:id')
  updateJobRole(@Param('id') id: string, @Body() dto: UpdateJobRoleDto) {
    return this.positions.updateJobRole(id, { name: dto.name });
  }

  @Patch('config')
  updateConfig(@Body() dto: UpdatePositionConfigDto) {
    return this.positions.updateConfig(dto as unknown as Record<string, unknown>);
  }
}
