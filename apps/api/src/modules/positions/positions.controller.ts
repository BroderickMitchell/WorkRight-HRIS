// src/modules/positions/positions.controller.ts
import { Controller, Get, Query, Body, Post, Param, Patch, Delete } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { OrgChartQueryDto } from './dto/org-chart-query.dto';
import { ListPositionsQueryDto } from './dto/list-positions-query.dto';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';
import { UpdatePositionConfigDto } from './dto/update-position-config.dto';
import { CreatePositionDto, UpdatePositionDto, AssignUserDto } from './dto/positions.dto';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get('org-chart')
  orgChart(@Query() query: OrgChartQueryDto) {
    return this.positions.orgChart({ rootId: query.rootId });
  }

  @Get()
  list(@Query() query: ListPositionsQueryDto) {
    return this.positions.list({ q: query.q, includeInactive: query.includeInactive });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.positions.get(id);
  }

  @Get(':id/children')
  children(@Param('id') id: string) {
    return this.positions.children(id);
  }

  @Post()
  create(@Body() dto: CreatePositionDto) {
    return this.positions.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.positions.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.positions.remove(id);
  }

  @Post(':id/assignments')
  assignUser(@Param('id') id: string, @Body() dto: AssignUserDto) {
    return this.positions.assignUser(id, dto);
  }

  @Delete(':id/assignments/:employeeId')
  removeUser(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.positions.removeUser(id, employeeId);
  }

  @Get('job-roles')
  listJobRoles() {
    return this.positions.listJobRoles();
  }

  @Post('job-roles')
  createJobRole(@Body() dto: CreateJobRoleDto) {
    return this.positions.createJobRole(dto);
  }

  @Patch('job-roles/:id')
  updateJobRole(@Param('id') id: string, @Body() dto: UpdateJobRoleDto) {
    return this.positions.updateJobRole(id, dto);
  }

  @Get('config/settings')
  getConfig() {
    return this.positions.getConfigSettings();
  }

  @Patch('config')
  updateConfig(@Body() dto: UpdatePositionConfigDto) {
    return this.positions.updateConfig(dto as Record<string, unknown>);
  }
}
