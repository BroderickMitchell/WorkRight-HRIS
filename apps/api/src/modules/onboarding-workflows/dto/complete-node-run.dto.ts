import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { WorkflowNodeRunStatus } from '@prisma/client';

export class CompleteNodeRunDto {
  @IsOptional()
  @IsString()
  nodeRunId?: string;

  @IsOptional()
  @IsEnum(WorkflowNodeRunStatus)
  status?: WorkflowNodeRunStatus;

  @IsOptional()
  @IsObject()
  output?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
