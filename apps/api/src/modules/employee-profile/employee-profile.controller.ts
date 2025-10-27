import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  costSplitInputSchema,
  employeeHistoryFiltersSchema,
  generateDocumentInputSchema,
  updateEmployeeProfileSchema,
  upsertCostSplitSchema
} from '@workright/profile-schema';
import { EmployeeProfileService } from './employee-profile.service.js';
import { Roles } from '../../common/auth/roles.decorator.js';

@ApiTags('Employees')
@Controller('employees')
export class EmployeeProfileController {
  constructor(private readonly service: EmployeeProfileService) {}

  @Get(':id')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER', 'EMPLOYEE')
  getProfile(@Param('id') id: string) {
    return this.service.getEmployeeProfile(id);
  }

  @Patch(':id')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER', 'EMPLOYEE')
  updateProfile(@Param('id') id: string, @Body() body: unknown) {
    const parsed = updateEmployeeProfileSchema.parse(body);
    return this.service.updateSection(id, parsed);
  }

  @Get(':id/cost-splits')
  @Roles('HR_ADMIN', 'HRBP', 'FINANCE')
  getCostSplits(@Param('id') id: string) {
    return this.service.listCostSplits(id);
  }

  @Post(':id/cost-splits')
  @Roles('HR_ADMIN', 'HRBP', 'FINANCE')
  upsertCostSplits(@Param('id') id: string, @Body() body: unknown) {
    const parsed = upsertCostSplitSchema.parse(body);
    return this.service.upsertCostSplits(id, parsed);
  }

  @Patch('cost-splits/:splitId')
  @Roles('HR_ADMIN', 'HRBP', 'FINANCE')
  updateCostSplit(@Param('splitId') splitId: string, @Body() body: unknown) {
    const split = costSplitInputSchema.parse(body);
    return this.service.updateSingleCostSplit(splitId, split);
  }

  @Delete('cost-splits/:splitId')
  @Roles('HR_ADMIN', 'HRBP', 'FINANCE')
  deleteCostSplit(@Param('splitId') splitId: string) {
    return this.service.deleteCostSplit(splitId);
  }

  @Get(':id/history')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER', 'EMPLOYEE')
  getHistory(@Param('id') id: string, @Query() query: Record<string, unknown>) {
    const filters = employeeHistoryFiltersSchema.partial().parse(query ?? {});
    return this.service.listHistory(id, filters);
  }

  @Get(':id/history/export')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER')
  exportHistory(@Param('id') id: string, @Query() query: Record<string, unknown>) {
    const filters = employeeHistoryFiltersSchema.partial().parse(query ?? {});
    return this.service.exportHistory(id, filters);
  }

  @Post(':id/documents/generate')
  @Roles('HR_ADMIN', 'HRBP')
  generateDocument(@Param('id') id: string, @Body() body: unknown) {
    const dto = generateDocumentInputSchema.parse(body);
    return this.service.generateDocument(id, dto);
  }

  @Get(':id/documents')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER', 'EMPLOYEE')
  listDocuments(@Param('id') id: string) {
    return this.service.listDocuments(id);
  }

  @Get('documents/:docId/download')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER', 'EMPLOYEE')
  async downloadDocument(@Param('docId') docId: string, @Res() res: Response) {
    const download = await this.service.getDownloadStream(docId);
    res.setHeader('Content-Type', download.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${download.filename}"`);
    download.stream.pipe(res);
  }
}
