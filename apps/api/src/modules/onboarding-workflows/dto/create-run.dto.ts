import { IsDateString, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateWorkflowRunDto {
  @IsString()
  workflowId!: string;

  @IsString()
  assigneeUserId!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
