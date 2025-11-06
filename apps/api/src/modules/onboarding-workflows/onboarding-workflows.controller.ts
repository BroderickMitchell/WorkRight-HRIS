import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkflowStatus } from '@prisma/client';
import { Roles } from '../../common/auth/roles.decorator.js';
import { OnboardingWorkflowsService } from './onboarding-workflows.service.js';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/create-workflow.dto.js';
import { SaveGraphDto } from './dto/save-graph.dto.js';
import { ActivateWorkflowDto } from './dto/activate-workflow.dto.js';
import { CreateWorkflowRunDto } from './dto/create-run.dto.js';
import { CompleteNodeRunDto } from './dto/complete-node-run.dto.js';

@ApiTags('Onboarding Workflows')
@Controller()
export class OnboardingWorkflowsController {
  constructor(private readonly workflows: OnboardingWorkflowsService) {}

  @Get('workflows')
  @Roles('HR_ADMIN', 'HRBP')
  list(@Query('status') status?: WorkflowStatus | string) {
    const parsed = status && Object.values(WorkflowStatus).includes(status as WorkflowStatus)
      ? (status as WorkflowStatus)
      : undefined;
    return this.workflows.list(parsed);
  }

  @Get('workflows/resources')
  @Roles('HR_ADMIN', 'HRBP')
  resources() {
    return this.workflows.getResources();
  }

  @Post('workflows')
  @Roles('HR_ADMIN', 'HRBP')
  create(@Body() dto: CreateWorkflowDto) {
    return this.workflows.create(dto);
  }

  @Get('workflows/:id')
  @Roles('HR_ADMIN', 'HRBP')
  get(@Param('id') id: string) {
    return this.workflows.getById(id);
  }

  @Put('workflows/:id')
  @Roles('HR_ADMIN', 'HRBP')
  update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflows.updateMeta(id, dto);
  }

  @Put('workflows/:id/graph')
  @Roles('HR_ADMIN', 'HRBP')
  saveGraph(@Param('id') id: string, @Body() dto: SaveGraphDto) {
    return this.workflows.saveGraph(id, dto);
  }

  @Post('workflows/:id/activate')
  @Roles('HR_ADMIN', 'HRBP')
  activate(@Param('id') id: string, @Body() dto: ActivateWorkflowDto) {
    return this.workflows.activate(id, dto);
  }

  @Post('workflow-runs')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER')
  startRun(@Body() dto: CreateWorkflowRunDto) {
    return this.workflows.createRun(dto);
  }

  @Get('workflow-runs/:id')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER')
  getRun(@Param('id') id: string) {
    return this.workflows.getRun(id);
  }

  @Post('node-runs/:id/complete')
  @Roles('HR_ADMIN', 'HRBP', 'MANAGER')
  completeNode(@Param('id') id: string, @Body() dto: CompleteNodeRunDto) {
    return this.workflows.completeNodeRun(id, dto);
  }

  @Post('workflows/forms/:formTemplateId/update-instances')
  @Roles('HR_ADMIN', 'HRBP')
  refreshForms(@Param('formTemplateId') formTemplateId: string) {
    return this.workflows.updateFormInstances(formTemplateId);
  }
}
