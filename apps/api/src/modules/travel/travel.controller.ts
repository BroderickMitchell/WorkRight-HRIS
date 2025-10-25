import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/auth/roles.decorator.js';
import { OccupancyQueryDto, PlanTravelDto, ManifestQueryDto } from './travel.dto.js';
import { TravelService } from './travel.service.js';

@Controller()
export class TravelController {
  constructor(private readonly travel: TravelService) {}

  @Post('travel/plan')
  @Roles('HR_ADMIN', 'MANAGER')
  plan(@Body() dto: PlanTravelDto) { return this.travel.planTravel(dto); }

  @Get('travel/manifests')
  @Roles('HR_ADMIN', 'MANAGER', 'PAYROLL', 'AUDITOR')
  manifests(@Query() q: ManifestQueryDto) { return this.travel.getManifest(q.date); }

  @Get('accom/occupancy')
  @Roles('HR_ADMIN', 'MANAGER')
  occupancy(@Query() q: OccupancyQueryDto) { return this.travel.getOccupancy(q.locationId, q.date); }
}
