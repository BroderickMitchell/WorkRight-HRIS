import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Roles } from '../../common/auth/roles.decorator.js';
import {
  AssignUserDto,
  CreateJobRoleDto,
  CreatePositionDto,
  ListPositionsQueryDto,
  OrgChartQueryDto,
  UpdateJobRoleDto,
  UpdatePositionConfigDto,
  UpdatePositionDto
} from './positions.dto.js';
import { PositionsService } from './positions.service.js';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get('orgchart')
  getOrgChart(@Query() query: OrgChartQueryDto) {
    return this.positions.orgChart(query);
  }

  @Get()
  listPositions(@Query() query: ListPositionsQueryDto) {
    return this.positions.list(query);
  }

  @Get(':id')
  getPosition(@Param('id') id: string) {
    return this.positions.get(id);
  }

  @Get(':id/children')
  getChildren(@Param('id') id: string) {
    return this.positions.children(id);
  }

  @Post()
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER')
  createPosition(@Body() dto: CreatePositionDto) {
    return this.positions.create(dto);
  }

  @Put(':id')
  @Roles('HR_ADMIN', 'HRBP')
  updatePosition(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.positions.update(id, dto);
  }

  @Delete(':id')
  @Roles('HR_ADMIN')
  deletePosition(@Param('id') id: string) {
    return this.positions.remove(id);
  }

  @Post(':id/assign-user')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER')
  assignUser(@Param('id') id: string, @Body() dto: AssignUserDto) {
    return this.positions.assignUser(id, dto);
  }

  @Delete(':id/assign-user/:employeeId')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER')
  removeAssignment(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.positions.removeUser(id, employeeId);
  }
}

@Controller('jobroles')
export class JobRolesController {
  constructor(private readonly positions: PositionsService) {}

  @Get()
  listJobRoles() {
    return this.positions.listJobRoles();
  }

  @Post()
  @Roles('HR_ADMIN', 'HRBP')
  createJobRole(@Body() dto: CreateJobRoleDto) {
    return this.positions.createJobRole(dto);
  }

  @Put(':id')
  @Roles('HR_ADMIN', 'HRBP')
  updateJobRole(@Param('id') id: string, @Body() dto: UpdateJobRoleDto) {
    return this.positions.updateJobRole(id, dto);
  }
}

@Controller('config/position-management')
export class PositionManagementConfigController {
  constructor(private readonly positions: PositionsService) {}

  @Get()
  @Roles('HR_ADMIN', 'HRBP')
  getConfig() {
    return this.positions.getConfigSettings();
  }

  @Put()
  @Roles('HR_ADMIN', 'HRBP')
  updateConfig(@Body() dto: UpdatePositionConfigDto) {
    return this.positions.updateConfig(dto);
  }
}
