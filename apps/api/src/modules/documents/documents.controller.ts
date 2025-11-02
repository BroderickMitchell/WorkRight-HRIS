import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { DocumentsService } from './documents.service.js';
import { Roles } from '../../common/auth/roles.decorator.js';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get('templates')
  @Roles('HR_ADMIN', 'HRBP', 'PAYROLL')
  listTemplates(@Query() query: Record<string, unknown>) {
    return this.documents.listTemplates(query ?? {});
  }

  @Get('templates/:id')
  @Roles('HR_ADMIN', 'HRBP', 'PAYROLL')
  getTemplate(@Param('id') id: string) {
    return this.documents.getTemplate(id);
  }

  @Post('templates')
  @Roles('HR_ADMIN', 'HRBP')
  createTemplate(@Body() body: Record<string, unknown>) {
    return this.documents.createTemplate(body ?? {});
  }

  @Post('templates/:id/versions')
  @Roles('HR_ADMIN', 'HRBP')
  createVersion(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.documents.createVersion(id, body ?? {});
  }

  @Patch('templates/:id')
  @Roles('HR_ADMIN', 'HRBP')
  updateTemplate(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.documents.updateMetadata(id, body ?? {});
  }

  @Delete('templates/:id')
  @Roles('HR_ADMIN', 'HRBP')
  archiveTemplate(@Param('id') id: string) {
    return this.documents.deleteTemplate(id);
  }

  @Post('preview')
  @Roles('HR_ADMIN', 'HRBP', 'PAYROLL')
  preview(@Body() body: Record<string, unknown>) {
    return this.documents.preview(body ?? {});
  }

  @Post('sign')
  @Roles('HR_ADMIN', 'HRBP')
  sign(@Body() body: Record<string, unknown>) {
    return this.documents.signDocument(body ?? {});
  }

  @Get(':id/download')
  @Roles('HR_ADMIN', 'HRBP', 'PAYROLL', 'MANAGER', 'EMPLOYEE')
  async download(@Param('id') id: string, @Res() res: Response) {
    const download = await this.documents.getDownloadDescriptor(id);
    res.set('Content-Type', download.mimeType);
    res.set('Content-Disposition', `attachment; filename="${download.filename}"`);
    download.stream.pipe(res);
  }
}
