import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PerformanceService } from './performance.service.js';
import { CreateGoalDto, CreateReviewCycleDto } from './performance.dto.js';

@ApiTags('Performance')
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performance: PerformanceService) {}

  @Post('goals')
  createGoal(@Body() dto: CreateGoalDto) {
    return this.performance.createGoal(dto);
  }

  @Get('goals')
  listGoals(@Query('ownerId') ownerId?: string) {
    return this.performance.listGoals(ownerId);
  }

  @Post('review-cycles')
  createReviewCycle(@Body() dto: CreateReviewCycleDto) {
    return this.performance.createReviewCycle(dto);
  }

  @Get('review-cycles/:id/summary')
  getReviewCycleSummary(@Param('id') id: string) {
    return this.performance.getReviewCycleSummary(id);
  }
}
