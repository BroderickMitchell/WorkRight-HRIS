import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportingService } from './reporting.service.js';

@ApiTags('Reporting')
@Controller('reporting')
export class ReportingController {
  constructor(private readonly reporting: ReportingService) {}

  @Get('dashboards/headcount')
  headcount() {
    return this.reporting.headcountDashboard();
  }

  @Get('dashboards/leave')
  leaveDashboard() {
    return this.reporting.leaveDashboard();
  }

  @Get('reports/ad-hoc')
  adHoc(@Query('entity') entity: string) {
    return this.reporting.adHoc(entity);
  }
}
