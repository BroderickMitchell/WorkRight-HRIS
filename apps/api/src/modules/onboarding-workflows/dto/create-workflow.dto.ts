import { IsOptional, IsString, IsEnum } from 'class-validator';
import { WorkflowStatus } from '@prisma/client';

export class CreateWorkflowDto {
  @IsString()
  name!: string;
}

export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;
}
