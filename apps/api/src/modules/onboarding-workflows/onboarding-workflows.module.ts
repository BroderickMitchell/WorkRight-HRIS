import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module.js';
import { AuditModule } from '../../common/audit.module.js';
import { OnboardingWorkflowsController } from './onboarding-workflows.controller.js';
import { OnboardingWorkflowsService } from './onboarding-workflows.service.js';
import { WorkflowFieldMapService } from './field-map.service.js';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [OnboardingWorkflowsController],
  providers: [OnboardingWorkflowsService, WorkflowFieldMapService],
  exports: [OnboardingWorkflowsService]
})
export class OnboardingWorkflowsModule {}
