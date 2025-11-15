import { IsOptional, IsString, IsEnum } from 'class-validator';
import type { WorkflowStatus } from '@prisma/client';

const WORKFLOW_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED'
} as const satisfies Record<string, WorkflowStatus>;

export class CreateWorkflowDto {
  @IsString()
  name!: string;
}

export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(WORKFLOW_STATUS)
  status?: WorkflowStatus;
}
