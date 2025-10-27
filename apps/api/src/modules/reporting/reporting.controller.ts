import { Controller, Get, Query, Header } from '@nestjs/common';
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

  @Get('csv/positions/master')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async positionsMasterCsv() {
    return this.reporting.positionsMasterCsv();
  }

  @Get('csv/positions/cycle-times')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async positionsCycleTimesCsv() {
    return this.reporting.positionsCycleTimesCsv();
  }

  @Get('csv/positions/summary')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async positionsSummaryCsv() {
    return this.reporting.positionsSummaryCsv();
  }
}
