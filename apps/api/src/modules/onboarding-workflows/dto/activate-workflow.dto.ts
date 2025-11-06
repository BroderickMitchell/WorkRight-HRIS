import { IsOptional, IsString } from 'class-validator';

export class ActivateWorkflowDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
