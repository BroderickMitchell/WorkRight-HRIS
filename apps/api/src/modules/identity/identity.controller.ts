import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IdentityService } from './identity.service.js';
import { CreateTenantDto, CreateUserDto } from './identity.dto.js';

@ApiTags('Identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('tenants')
  createTenant(@Body() dto: CreateTenantDto) {
    return this.identityService.createTenant(dto);
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.identityService.createUser(dto);
  }

  @Get('tenants/:slug/settings')
  getTenantSettings(@Param('slug') slug: string) {
    return this.identityService.getTenantSettings(slug);
  }
}
