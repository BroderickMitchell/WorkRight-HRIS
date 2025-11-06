import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { WorkflowNodeRunStatus } from '@prisma/client';

export class CompleteNodeRunDto {
  @IsOptional()
  @IsEnum(WorkflowNodeRunStatus)
  status?: WorkflowNodeRunStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
