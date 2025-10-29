import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/auth/roles.decorator.js';
import { CreateRosterTemplateDto, AssignRosterDto, GenerateShiftsDto } from './rosters.dto.js';
import { RostersService } from './rosters.service.js';

@Controller('rosters')
export class RostersController {
  constructor(private readonly rosters: RostersService) {}

  @Get('templates')
  @Roles('HR_ADMIN', 'MANAGER', 'PAYROLL', 'AUDITOR')
  listTemplates(): any { return this.rosters.listTemplates(); }

  @Post('templates')
  @Roles('HR_ADMIN', 'MANAGER')
  createTemplate(@Body() dto: CreateRosterTemplateDto): any { return this.rosters.createTemplate(dto); }

  @Get('assignments')
  @Roles('HR_ADMIN', 'MANAGER', 'PAYROLL', 'AUDITOR')
  listAssignments(@Query('employeeId') employeeId?: string): any {
    return this.rosters.listAssignments(employeeId);
  }

  @Post('assignments')
  @Roles('HR_ADMIN', 'MANAGER')
  assign(@Body() dto: AssignRosterDto & { templateId: string }): any { return this.rosters.assign(dto); }

  @Get('shifts')
  @Roles('HR_ADMIN', 'MANAGER', 'PAYROLL', 'AUDITOR')
  getShifts(@Query() q: GenerateShiftsDto) { return this.rosters.generateShifts(q); }
}
