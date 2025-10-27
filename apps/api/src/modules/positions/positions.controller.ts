import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/auth/roles.decorator.js';
import { ApprovePositionDto, CreatePositionDto, EditPositionDto, SubmitPositionDto } from './positions.dto.js';
import { PositionsService } from './positions.service.js';

@Controller()
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get('org/positions')
  listForOrg(@Query('status') status?: 'pending' | 'active') { return this.positions.listForOrg(status); }

  @Post('positions')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER')
  create(@Body() dto: CreatePositionDto) { return this.positions.create(dto); }

  @Get('positions/:id')
  get(@Param('id') id: string) { return this.positions.get(id); }

  @Patch('positions/:id')
  @Roles('HR_ADMIN', 'HRBP')
  edit(@Param('id') id: string, @Body() dto: EditPositionDto) { return this.positions.edit(id, dto); }

  @Post('positions/:id/submit')
  @Roles('HR_ADMIN', 'HRBP')
  submit(@Param('id') id: string, @Body() dto: SubmitPositionDto) { return this.positions.submit(id, dto); }

  @Post('positions/:id/approve')
  @Roles('HR_ADMIN', 'HRBP', 'FINANCE', 'EXEC', 'MANAGER')
  approve(@Param('id') id: string, @Body() dto: ApprovePositionDto) { return this.positions.approve(id, dto); }

  @Post('positions/:id/activate')
  @Roles('HR_ADMIN')
  activate(@Param('id') id: string) { return this.positions.activate(id); }
}

