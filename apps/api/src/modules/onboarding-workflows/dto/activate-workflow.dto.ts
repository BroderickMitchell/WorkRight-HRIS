import { IsOptional, IsString } from 'class-validator';

export class ActivateWorkflowDto {
  @IsString()
  workflowVersionId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
