import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../../common/auth/roles.decorator.js';
import { CreatePayrollRunDto, UpsertPayProfileDto } from './payroll.dto.js';
import { PayrollService } from './payroll.service.js';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  @Post('runs')
  @Roles('PAYROLL', 'HR_ADMIN')
  createRun(@Body() dto: CreatePayrollRunDto) { return this.payroll.createRun(dto); }

  @Get('runs')
  @Roles('PAYROLL', 'HR_ADMIN', 'AUDITOR')
  listRuns() { return this.payroll.listRuns(); }

  @Get('runs/:id')
  @Roles('PAYROLL', 'HR_ADMIN', 'AUDITOR')
  getRun(@Param('id') id: string) { return this.payroll.getRun(id); }

  @Get('profiles/:employeeId')
  @Roles('PAYROLL', 'HR_ADMIN', 'AUDITOR')
  getProfile(@Param('employeeId') employeeId: string) { return this.payroll.getProfile(employeeId); }

  @Post('profiles')
  @Roles('PAYROLL', 'HR_ADMIN')
  upsertProfile(@Body() dto: UpsertPayProfileDto) { return this.payroll.upsertProfile(dto); }
}
