// src/modules/onboarding-workflows/onboarding-workflows.controller.ts
import { Controller, Get, Param, Query, Body, Post, Patch } from '@nestjs/common';
import { OnboardingWorkflowsService, ListQuery } from './onboarding-workflows.service';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { SaveGraphDto } from './dto/save-graph.dto';
import { ActivateDto } from './dto/activate.dto';
import { CreateRunDto } from './dto/create-run.dto';
import { CompleteNodeRunDto } from './dto/complete-node-run.dto';

@Controller('onboarding-workflows')
export class OnboardingWorkflowsController {
  constructor(private readonly workflows: OnboardingWorkflowsService) {}

  @Get()
  list(@Query('q') q?: string) {
    const query: ListQuery = q ? { q } : undefined;
    return this.workflows.list(query);
  }

  @Get('resources')
  resources() {
    return this.workflows.getResources();
  }

  @Post()
  create(@Body() dto: { name: string }) {
    return this.workflows.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.workflows.getById(id);
  }

  @Patch(':id/meta')
  updateMeta(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflows.updateMeta(id, dto);
  }

  @Patch(':id/graph')
  saveGraph(@Param('id') id: string, @Body() dto: SaveGraphDto) {
    return this.workflows.saveGraph(id, dto);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string, @Body() dto: ActivateDto) {
    return this.workflows.activate(id, dto);
  }

  @Post('runs')
  createRun(@Body() dto: CreateRunDto) {
    return this.workflows.createRun(dto);
  }

  @Get('runs/:id')
  getRun(@Param('id') id: string) {
    return this.workflows.getRun(id);
  }

  @Post('node-runs/:id/complete')
  completeNodeRun(@Param('id') id: string, @Body() dto: CompleteNodeRunDto) {
    return this.workflows.completeNodeRun(id, dto);
  }
}
