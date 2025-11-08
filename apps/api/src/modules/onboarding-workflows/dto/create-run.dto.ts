import { IsDateString, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateRunDto {
  @IsString()
  workflowId!: string;

  @IsOptional()
  @IsString()
  workflowVersionId?: string;

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
