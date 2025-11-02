import { Body, Controller, Get, Param, Put, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TenantBrandingService } from './tenant-branding.service.js';
import { Roles } from '../../common/auth/roles.decorator.js';

@ApiTags('Tenant')
@Controller('tenant/branding')
export class TenantBrandingController {
  constructor(private readonly service: TenantBrandingService) {}

  @Get()
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER', 'EMPLOYEE')
  getBranding() {
    return this.service.getBranding();
  }

  @Put()
  @Roles('HR_ADMIN')
  updateBranding(@Body() body: Record<string, unknown>) {
    return this.service.updateBranding(body ?? {});
  }

  @Get('assets/:kind')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER', 'EMPLOYEE')
  async getAsset(@Param('kind') kind: string, @Res() res: Response) {
    const asset = await this.service.getAsset(kind);
    res.set('Content-Type', asset.mimeType);
    asset.stream.pipe(res);
  }
}
