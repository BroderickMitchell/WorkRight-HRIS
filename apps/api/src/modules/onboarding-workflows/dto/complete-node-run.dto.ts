import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import type { WorkflowNodeRunStatus } from '@prisma/client';

const WORKFLOW_NODE_RUN_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  FAILED: 'FAILED'
} as const satisfies Record<string, WorkflowNodeRunStatus>;

export class CompleteNodeRunDto {
  @IsOptional()
  @IsString()
  nodeRunId?: string;

  @IsOptional()
  @IsEnum(WORKFLOW_NODE_RUN_STATUS)
  status?: WorkflowNodeRunStatus;

  @IsOptional()
  @IsObject()
  output?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
